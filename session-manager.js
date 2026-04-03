/**
 * SessionManager v1.0
 * Управление сессиями тренировки общения с брокером
 * 
 * Validates: Requirements 5.5, 10.4, 10.5
 * 
 * Firestore Structure:
 * brokerSessions/{sessionId}/
 *   - uid: string
 *   - scenario: string
 *   - brokerName: string
 *   - startedAt: Timestamp
 *   - completedAt: Timestamp | null
 *   - messages: array
 *   - metrics: object | null
 *   - xpAwarded: number
 *   - duration: number (seconds)
 */

import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  getDocs,
  Timestamp,
  arrayUnion,
  increment,
  runTransaction
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

class SessionManager {
  /**
   * @param {string} uid - Firebase user ID
   */
  constructor(uid) {
    if (!uid) {
      throw new Error('SessionManager requires a valid uid');
    }
    this.uid = uid;
    this.db = getFirestore();
  }

  /**
   * Start a new training session
   * Creates a document in brokerSessions collection
   * 
   * @param {string} scenario - Scenario ID (free, negotiate, book, problem, cold, followup)
   * @param {string} brokerName - Name of the AI broker
   * @returns {Promise<string>} sessionId - Auto-generated session ID
   * 
   * Validates: Requirement 5.5
   */
  async startSession(scenario, brokerName = 'Mike') {
    try {
      // Validate scenario
      const validScenarios = ['free', 'negotiate', 'book', 'problem', 'cold', 'followup'];
      if (!validScenarios.includes(scenario)) {
        throw new Error(`Invalid scenario: ${scenario}. Must be one of: ${validScenarios.join(', ')}`);
      }

      // Create new session document with auto-generated ID
      const sessionsRef = collection(this.db, 'brokerSessions');
      const newSessionRef = doc(sessionsRef);
      const sessionId = newSessionRef.id;

      const sessionData = {
        sessionId: sessionId,
        uid: this.uid,
        scenario: scenario,
        brokerName: brokerName,
        startedAt: Timestamp.now(),
        completedAt: null,
        messages: [],
        metrics: null,
        xpAwarded: 0,
        duration: 0
      };

      await setDoc(newSessionRef, sessionData);

      console.log(`[SessionManager] Session started: ${sessionId}, scenario: ${scenario}`);
      return sessionId;

    } catch (error) {
      console.error('[SessionManager] Error starting session:', error);
      throw new Error(`Failed to start session: ${error.message}`);
    }
  }

  /**
   * Save a message to the session
   * Adds message to the messages array
   * 
   * @param {string} sessionId - Session ID
   * @param {Object} message - Message object
   * @param {string} message.type - Message type ('user' | 'broker' | 'system')
   * @param {string} message.content - Message content
   * @param {Timestamp} [message.timestamp] - Optional timestamp (defaults to now)
   * @returns {Promise<void>}
   * 
   * Validates: Requirement 5.5
   */
  async saveMessage(sessionId, message) {
    try {
      // Validate message structure
      if (!message || typeof message !== 'object') {
        throw new Error('Message must be an object');
      }

      if (!message.type || !['user', 'broker', 'system'].includes(message.type)) {
        throw new Error('Message type must be one of: user, broker, system');
      }

      if (!message.content || typeof message.content !== 'string') {
        throw new Error('Message content must be a non-empty string');
      }

      // Prepare message with timestamp
      const messageData = {
        type: message.type,
        content: message.content,
        timestamp: message.timestamp || Timestamp.now()
      };

      // Update session document - add message to array
      const sessionRef = doc(this.db, 'brokerSessions', sessionId);
      await updateDoc(sessionRef, {
        messages: arrayUnion(messageData)
      });

      console.log(`[SessionManager] Message saved to session ${sessionId}: ${message.type}`);

    } catch (error) {
      console.error('[SessionManager] Error saving message:', error);
      throw new Error(`Failed to save message: ${error.message}`);
    }
  }

  /**
   * End the session and save performance metrics
   * Updates completedAt, metrics, xpAwarded, and duration
   * 
   * @param {string} sessionId - Session ID
   * @param {Object} metrics - Performance metrics
   * @param {number} metrics.professionalism - Score 1-10
   * @param {number} metrics.effectiveness - Score 1-10
   * @param {number} metrics.terminology - Score 1-10
   * @param {number} metrics.avgScore - Average score
   * @param {string} metrics.feedback - Text feedback
   * @param {Array} [metrics.highlights] - Array of highlight objects
   * @returns {Promise<void>}
   * 
   * Validates: Requirements 10.4, 10.5
   */
  async endSession(sessionId, metrics) {
    try {
      // Validate metrics structure
      if (!metrics || typeof metrics !== 'object') {
        throw new Error('Metrics must be an object');
      }

      const requiredFields = ['professionalism', 'effectiveness', 'terminology', 'avgScore', 'feedback'];
      for (const field of requiredFields) {
        if (metrics[field] === undefined || metrics[field] === null) {
          throw new Error(`Metrics missing required field: ${field}`);
        }
      }

      // Validate score ranges
      const scores = [metrics.professionalism, metrics.effectiveness, metrics.terminology];
      for (const score of scores) {
        if (typeof score !== 'number' || score < 1 || score > 10) {
          throw new Error('Scores must be numbers between 1 and 10');
        }
      }

      // Get session to calculate duration
      const sessionRef = doc(this.db, 'brokerSessions', sessionId);
      const sessionSnap = await getDoc(sessionRef);

      if (!sessionSnap.exists()) {
        throw new Error(`Session not found: ${sessionId}`);
      }

      const sessionData = sessionSnap.data();
      const startedAt = sessionData.startedAt;
      const completedAt = Timestamp.now();
      
      // Calculate duration in seconds
      const duration = Math.floor((completedAt.toMillis() - startedAt.toMillis()) / 1000);

      // Calculate XP based on average score
      // Base: 50 XP for completion
      // Bonus: +25 XP if avgScore >= 8
      // Bonus: +50 XP if avgScore >= 9
      let xpAwarded = 50;
      if (metrics.avgScore >= 9) {
        xpAwarded += 50;
      } else if (metrics.avgScore >= 8) {
        xpAwarded += 25;
      }

      // Update session document
      await updateDoc(sessionRef, {
        completedAt: completedAt,
        metrics: metrics,
        xpAwarded: xpAwarded,
        duration: duration
      });

      console.log(`[SessionManager] Session ended: ${sessionId}, XP awarded: ${xpAwarded}, duration: ${duration}s`);

      // Update user statistics
      await this.updateUserStats(sessionData.scenario, metrics);

    } catch (error) {
      console.error('[SessionManager] Error ending session:', error);
      throw new Error(`Failed to end session: ${error.message}`);
    }
  }

  /**
   * Update user's broker statistics
   * Updates running averages and session counts
   * 
   * @param {string} scenario - Scenario ID
   * @param {Object} metrics - Performance metrics
   * @param {number} metrics.professionalism - Score 1-10
   * @param {number} metrics.effectiveness - Score 1-10
   * @param {number} metrics.terminology - Score 1-10
   * @returns {Promise<void>}
   * 
   * Validates: Requirement 6.6
   */
  async updateUserStats(scenario, metrics) {
    try {
      const userRef = doc(this.db, 'users', this.uid);

      // Use transaction to ensure atomic updates
      await runTransaction(this.db, async (transaction) => {
        const userDoc = await transaction.get(userRef);

        if (!userDoc.exists()) {
          throw new Error(`User document not found: ${this.uid}`);
        }

        const userData = userDoc.data();
        const currentStats = userData.brokerStats || {
          totalSessions: 0,
          completedSessions: 0,
          avgProfessionalism: 0,
          avgEffectiveness: 0,
          avgTerminology: 0,
          totalXPFromBroker: 0,
          favoriteScenario: null,
          lastSessionAt: null
        };

        // Calculate new running averages
        const n = currentStats.completedSessions;
        const newAvgProfessionalism = ((currentStats.avgProfessionalism * n) + metrics.professionalism) / (n + 1);
        const newAvgEffectiveness = ((currentStats.avgEffectiveness * n) + metrics.effectiveness) / (n + 1);
        const newAvgTerminology = ((currentStats.avgTerminology * n) + metrics.terminology) / (n + 1);

        // Update stats
        const updatedStats = {
          totalSessions: currentStats.totalSessions + 1,
          completedSessions: currentStats.completedSessions + 1,
          avgProfessionalism: Math.round(newAvgProfessionalism * 10) / 10, // Round to 1 decimal
          avgEffectiveness: Math.round(newAvgEffectiveness * 10) / 10,
          avgTerminology: Math.round(newAvgTerminology * 10) / 10,
          totalXPFromBroker: currentStats.totalXPFromBroker,
          favoriteScenario: scenario, // Simple approach: last scenario
          lastSessionAt: Timestamp.now()
        };

        transaction.update(userRef, {
          brokerStats: updatedStats
        });

        console.log(`[SessionManager] User stats updated for ${this.uid}:`, updatedStats);
      });

    } catch (error) {
      console.error('[SessionManager] Error updating user stats:', error);
      throw new Error(`Failed to update user stats: ${error.message}`);
    }
  }

  /**
   * Get session history for a specific session
   * 
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Session data
   */
  async getSessionHistory(sessionId) {
    try {
      const sessionRef = doc(this.db, 'brokerSessions', sessionId);
      const sessionSnap = await getDoc(sessionRef);

      if (!sessionSnap.exists()) {
        throw new Error(`Session not found: ${sessionId}`);
      }

      return sessionSnap.data();

    } catch (error) {
      console.error('[SessionManager] Error getting session history:', error);
      throw new Error(`Failed to get session history: ${error.message}`);
    }
  }

  /**
   * Get user's session history
   * Returns most recent sessions for the current user
   * 
   * @param {number} [limitCount=10] - Maximum number of sessions to return
   * @returns {Promise<Array>} Array of session objects
   * 
   * Validates: Requirement 5.5
   */
  /**
   * Mark a session as interrupted (page closed/refreshed mid-session)
   * Called from beforeunload handler — must be synchronous-friendly
   * 
   * @param {string} sessionId - Session ID to mark as interrupted
   * @returns {Promise<void>}
   */
  async markSessionInterrupted(sessionId) {
    if (!sessionId) return;
    try {
      const sessionRef = doc(this.db, 'brokerSessions', sessionId);
      await updateDoc(sessionRef, {
        status: 'interrupted',
        interruptedAt: Timestamp.now()
      });
      console.log('[SessionManager] Session marked as interrupted:', sessionId);
    } catch (error) {
      console.error('[SessionManager] Error marking session interrupted:', error);
      // Silently ignore — page is closing
    }
  }

  async getUserSessions(limitCount = 10) {
    try {
      // Validate limit
      if (typeof limitCount !== 'number' || limitCount < 1) {
        throw new Error('Limit must be a positive number');
      }

      // Query sessions for this user, ordered by startedAt descending
      const sessionsRef = collection(this.db, 'brokerSessions');
      const q = query(
        sessionsRef,
        where('uid', '==', this.uid),
        orderBy('startedAt', 'desc'),
        firestoreLimit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const sessions = [];

      querySnapshot.forEach((doc) => {
        sessions.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log(`[SessionManager] Retrieved ${sessions.length} sessions for user ${this.uid}`);
      return sessions;

    } catch (error) {
      console.error('[SessionManager] Error getting user sessions:', error);
      throw new Error(`Failed to get user sessions: ${error.message}`);
    }
  }
}

// Export for use in other modules
export default SessionManager;
