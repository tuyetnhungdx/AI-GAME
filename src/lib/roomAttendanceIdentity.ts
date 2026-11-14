export function roomAttendanceIdentity(row: { class_name: string; student_name: string }) {
  return JSON.stringify([row.class_name, row.student_name].map(value =>
    value.normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase()
  ));
}
