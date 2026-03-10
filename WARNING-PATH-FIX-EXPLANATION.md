# WARNING PATH FIX - EXPLANATION

## PROBLEM
After choosing weak answer → warning path → good answer, dialogue was returning to FIRST question instead of continuing from saved position.

## ROOT CAUSE
The simulator didn't have logic to save and restore position when switching between master and warning paths.

## SOLUTION IMPLEMENTED

### Code Changes in `pages/simulator.html`

Added `savedMasterStep` variable to track position in master path:
```javascript
let savedMasterStep = 0; // Сохраняем позицию в master пути для возврата из warning
```

### Path Switching Logic (lines 5330-5350)

```javascript
// ЛОГИКА ПЕРЕКЛЮЧЕНИЯ ПУТЕЙ:
// 1. Если переходим ИЗ master В warning/warning_strict - сохраняем позицию master
if (oldPath === 'master' && (currentPath === 'warning' || currentPath === 'warning_strict')) {
    savedMasterStep = conversationStep; // Сохраняем текущую позицию в master
    conversationStep = -1; // Начинаем warning с шага 0
    console.log(`🔄 Path changed: ${oldPath} → ${currentPath} (saved master step: ${savedMasterStep}, starting warning from 0)`);
}
// 2. Если возвращаемся ИЗ warning/warning_strict В master - восстанавливаем позицию
else if ((oldPath === 'warning' || oldPath === 'warning_strict') && currentPath === 'master') {
    conversationStep = savedMasterStep; // Возвращаемся на сохраненную позицию в master
    console.log(`🔄 Path changed: ${oldPath} → ${currentPath} (restored master step: ${conversationStep})`);
}
// 3. Для всех остальных переходов (например, в reject_final) - сбрасываем на 0
else {
    conversationStep = -1;
    console.log(`🔄 Path changed: ${oldPath} → ${currentPath} (reset to step 0)`);
}
```

## HOW IT WORKS

### Example Flow:

1. **User on master step 2** (conversationStep=2)
   - Sees: master[2].brokerQuestion
   - Has: 6 suggestions

2. **User chooses weak answer** (variant 3, path="warning")
   - Save: savedMasterStep = 2
   - Set: conversationStep = -1, currentPath = "warning"
   - Increment: conversationStep++ → conversationStep = 0
   - Show: warning[0].brokerResponse + suggestions

3. **User chooses good answer** (variant 1, path="master")
   - Restore: conversationStep = savedMasterStep (2)
   - Set: currentPath = "master"
   - Increment: conversationStep++ → conversationStep = 3
   - Show: master[3].brokerResponse + master[3].brokerQuestion

**Result:** User continues from master[3] (the NEXT question after step 2) ✅

## TESTING

### Test Scenario v25:
- Dialogue: Chicago → Atlanta, Dry Van General Freight
- Structure: 11 master steps, warning path, warning_strict path, 11 reject paths
- Validation: ✅ 0 errors, 0 warnings

### Test Steps:
1. Start dialogue v25
2. On step 1 (MC question), choose variant 3 (normal) → goes to warning
3. On warning, choose variant 1 (excellent) → returns to master
4. Verify: Should see step 2 (Location question), NOT step 1 (MC question)

### Expected Console Output:
```
🔄 Path changed: master → warning (saved master step: 0, starting warning from 0)
🔄 Path changed: warning → master (restored master step: 0)
➡️ Moving to step 1, pathSteps.length=11
```

## STATUS
✅ Code implemented
⏳ Needs browser testing to verify

## NEXT STEPS
1. Open `pages/simulator.html` in browser
2. Test with dialogue v25
3. Verify warning path works correctly
4. Test edge cases:
   - warning → reject (should work)
   - warning_strict → master (should work)
   - warning_strict → reject (should work)
