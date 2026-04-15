import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from "react-native";
import { Colors } from "../constants/colors";
import { useGameStore } from "../store/gameStore";

function getPhraseTiles(replyTo) {
  if (!replyTo) return ["Hi,","Hello,","I have a truck available.","What is the rate?","Can you send the Rate Con?","Driver is ready.","Please confirm.","Thank you!","Best regards,","Let me know."];
  const msg = ((replyTo.message || "") + " " + (replyTo.subject || "")).toLowerCase();
  if (msg.includes("pod") || msg.includes("proof of delivery")) return ["Hi,","POD is attached.","Driver delivered on time.","Please find the POD below.","No issues during delivery.","Please process the invoice.","Let me know if you need anything else.","Thank you!","Best regards,"];
  if (msg.includes("detention") || msg.includes("задержк")) return ["Hi,","Driver has been waiting for","2 hours","3 hours","at the shipper.","Detention started at","Please approve detention pay.","$50/hour","BOL timestamp confirms arrival time.","Please confirm detention payment.","Thank you!"];
  if (msg.includes("rate con") || msg.includes("rate confirmation")) return ["Hi,","Rate Con received.","Confirmed.","Driver will be at pickup by","today","tomorrow","at 8:00 AM","at 10:00 AM","Please send updated Rate Con.","All good, thank you!","Best regards,"];
  if (msg.includes("issue") || msg.includes("problem") || msg.includes("complaint")) return ["Hi,","Apologies for the inconvenience.","Driver had a breakdown.","There was a traffic delay.","We will do better next time.","Driver arrived","30 minutes late","1 hour late","due to traffic.","Thank you for your patience."];
  if (msg.includes("груз") || msg.includes("load") || msg.includes("available")) return ["Hi,","I have a truck available.","Dry Van","Reefer","available in","Chicago","Dallas","Atlanta","What is the rate?","Can you do","$2.50/mile?","$3.00/mile?","Send me the Rate Con.","Thank you!"];
  return ["Hi,","Got it,","Confirmed.","Thank you for the update.","Driver is on the way.","Will keep you posted.","Please send details.","Rate Con received.","POD will follow.","Let me know.","Best regards,","Thanks!"];
}

export default function ComposeEmailModal({ visible, onClose, replyTo }) {
  const { sendEmail } = useGameStore();
  const [selected, setSelected] = useState([]);
  const [sent, setSent] = useState(false);
  const tiles = getPhraseTiles(replyTo);
  const toVal = replyTo?.from || "";
  const subjectVal = replyTo ? ("Re: " + replyTo.subject) : "New message";
  const bodyText = selected.join(" ");

  function handleTile(tile) {
    if (selected.includes(tile)) setSelected(selected.filter(t => t !== tile));
    else setSelected([...selected, tile]);
  }

  function handleSend() {
    if (!bodyText.trim()) return;
    sendEmail({ to: toVal, subject: subjectVal, body: bodyText, isReply: !!replyTo, replyToId: replyTo?.id });
    setSent(true);
    setTimeout(() => { setSent(false); setSelected([]); onClose(); }, 1200);
  }

  function handleClose() { setSelected([]); setSent(false); onClose(); }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={s.overlay}>
        <View style={s.modal}>
          <View style={s.header}>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>{replyTo ? "Ответить" : "Новое письмо"}</Text>
              {toVal ? <Text style={s.toText}>Кому: {toVal}</Text> : null}
            </View>
            <TouchableOpacity onPress={handleClose} style={s.closeBtn}>
              <Text style={s.closeBtnText}>X</Text>
            </TouchableOpacity>
          </View>

          {replyTo && (
            <View style={s.quoteWrap}>
              <Text style={s.quoteLabel}>Оригинал:</Text>
              <Text style={s.quoteText} numberOfLines={2}>{replyTo.message}</Text>
            </View>
          )}

          <View style={s.composedWrap}>
            <View style={s.composedHeader}>
              <Text style={s.composedLabel}>Твоё письмо:</Text>
              {selected.length > 0 && <TouchableOpacity onPress={() => setSelected([])}><Text style={s.clearBtn}>Очистить</Text></TouchableOpacity>}
            </View>
            <View style={s.composedTokens}>
              {selected.length === 0
                ? <Text style={s.placeholder}>Нажимай на фразы снизу →</Text>
                : selected.map((t, i) => (
                  <TouchableOpacity key={i} style={s.token} onPress={() => handleTile(t)}>
                    <Text style={s.tokenText}>{t}</Text>
                    <Text style={s.tokenX}> ×</Text>
                  </TouchableOpacity>
                ))
              }
            </View>
          </View>

          <View style={s.tilesWrap}>
            <Text style={s.tilesLabel}>Выбери фразы:</Text>
            <ScrollView style={{ maxHeight: 160 }} showsVerticalScrollIndicator={false}>
              <View style={s.tilesGrid}>
                {tiles.map((tile, i) => {
                  const sel = selected.includes(tile);
                  return (
                    <TouchableOpacity key={i} style={[s.tile, sel && s.tileSel]} onPress={() => handleTile(tile)} activeOpacity={0.7}>
                      <Text style={[s.tileText, sel && s.tileTextSel]}>{tile}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          <View style={s.footer}>
            <TouchableOpacity style={s.cancelBtn} onPress={handleClose}>
              <Text style={s.cancelText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.sendBtn, !bodyText.trim() && s.sendDisabled]} onPress={handleSend} disabled={!bodyText.trim()}>
              <Text style={s.sendText}>{sent ? "Отправлено!" : "Отправить"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "flex-end" },
  modal: { backgroundColor: "#0d1526", borderTopLeftRadius: 22, borderTopRightRadius: 22, borderWidth: 1, borderColor: "#1e2d45", maxHeight: "92%" },
  header: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#1e2d45" },
  title: { fontSize: 16, fontWeight: "900", color: "#fff" },
  toText: { fontSize: 11, color: "#64748b", marginTop: 2 },
  closeBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  closeBtnText: { fontSize: 14, color: "#94a3b8" },
  quoteWrap: { marginHorizontal: 14, marginTop: 10, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 8, borderLeftWidth: 3, borderLeftColor: "#06b6d4", padding: 10 },
  quoteLabel: { fontSize: 9, color: "#64748b", fontWeight: "700", marginBottom: 3, textTransform: "uppercase" },
  quoteText: { fontSize: 11, color: "#94a3b8", lineHeight: 16 },
  composedWrap: { margin: 14, marginBottom: 8, backgroundColor: "rgba(6,182,212,0.06)", borderRadius: 12, borderWidth: 1, borderColor: "rgba(6,182,212,0.2)", minHeight: 70, padding: 10 },
  composedHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  composedLabel: { fontSize: 10, fontWeight: "700", color: "#06b6d4", textTransform: "uppercase", letterSpacing: 0.5 },
  clearBtn: { fontSize: 11, color: "#ef4444", fontWeight: "700" },
  composedTokens: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  placeholder: { fontSize: 12, color: "#475569", fontStyle: "italic" },
  token: { flexDirection: "row", alignItems: "center", backgroundColor: "#06b6d4", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  tokenText: { fontSize: 12, color: "#fff", fontWeight: "700" },
  tokenX: { fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: "900" },
  tilesWrap: { marginHorizontal: 14, marginBottom: 8 },
  tilesLabel: { fontSize: 10, fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 },
  tilesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tile: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "#0d1526", borderRadius: 10, borderWidth: 1.5, borderColor: "#1e2d45" },
  tileSel: { backgroundColor: "rgba(6,182,212,0.12)", borderColor: "#06b6d4", opacity: 0.5 },
  tileText: { fontSize: 13, color: "#e2e8f0", fontWeight: "600" },
  tileTextSel: { color: "#06b6d4" },
  footer: { flexDirection: "row", gap: 10, padding: 14, borderTopWidth: 1, borderTopColor: "#1e2d45" },
  cancelBtn: { flex: 1, paddingVertical: 13, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "#1e2d45", alignItems: "center" },
  cancelText: { fontSize: 14, color: "#94a3b8", fontWeight: "600" },
  sendBtn: { flex: 2, paddingVertical: 13, borderRadius: 12, backgroundColor: "#06b6d4", alignItems: "center" },
  sendDisabled: { opacity: 0.35 },
  sendText: { fontSize: 14, fontWeight: "800", color: "#fff" },
});