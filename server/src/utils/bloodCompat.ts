const compatibleDonors: Record<string, string[]> = {
  "O-": ["O-"],
  "O+": ["O-", "O+"],
  "A-": ["O-", "A-"],
  "A+": ["O-", "O+", "A-", "A+"],
  "B-": ["O-", "B-"],
  "B+": ["O-", "O+", "B-", "B+"],
  "AB-": ["O-", "A-", "B-", "AB-"],
  "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"]
};

export function getCompatibleDonors(requestBloodType: string): string[] {
  return compatibleDonors[requestBloodType] ?? [];
}

export function getCompatibleRecipients(donorBloodType: string): string[] {
  return Object.entries(compatibleDonors)
    .filter(([, donorTypes]) => donorTypes.includes(donorBloodType))
    .map(([requestBloodType]) => requestBloodType);
}
