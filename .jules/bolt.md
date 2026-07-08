# Bolt's Journal
**Learning:** MutationObserver with global re-initialization (O(N) search) causes severe performance degradation as the number of elements increases. Event delegation on the document object provides O(1) initialization and automatic handling of dynamic elements without any overhead during DOM mutations.
**Action:** Always prefer global event delegation for generic interactive behaviors (like click feedback, haptics, etc.) instead of individual listeners or MutationObserver-based scanning.
