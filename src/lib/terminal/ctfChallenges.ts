export const stages=[
 {title:'The Suspicious Handover',answer:'MT-042',learning:'Evidence inspection: compare an event with its approval record and expected time window.',hints:['Compare the handover notices with the approved list in memo.txt.','Look for the notice outside the handover window with approved=no. Submit its handover identifier.']},
 {title:'Encoded Evidence',answer:'R7N4',learning:'Base64 is an encoding, not encryption. Decoding evidence reveals a correlation token without needing a secret key.',hints:['The dispatch file uses Base64. The README explains the decode command.','In the decoded message, find the value after correlation=. Submit that token, rather than the entire message.']},
 {title:'Final Investigation',answer:'TX-204',learning:'Log correlation: an identifier alone is insufficient. Match the handover, correlation token, destination, event type, and outcome.',hints:['Match the handover, correlation token, and destination from the first two stages against archive/audit.log.','Exclude blocked attempts, a different destination, and verification events. Submit the successful transfer event ID that matches all the evidence.']},
] as const;
export const completionFlag='PORTFOLIO{trace_the_handover}';
export const investigationGuide=`Meridian Transfer — The Hidden Incident
A short, fictional portfolio investigation. This is separate from the full Meridian Transfer project.

Stage 1: read memo.txt and transfer.log; submit the suspicious handover ID.
Stage 2: read evidence/dispatch.b64; decode its text; submit the correlation token.
Stage 3: correlate the evidence with archive/audit.log; submit the successful transfer event ID.

Commands: pwd, ls, cd, cat, decode base64 <text>, hint, hint 2, status, submit <answer>.
Use reset, then reset confirm, to restart. reset cancel keeps your progress.

All files and records are synthetic. Only this virtual directory is available.
Progress stays on this device. Browser-side answers are inspectable; this is an educational puzzle, not a secure competition.`;
