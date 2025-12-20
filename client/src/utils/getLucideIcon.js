import * as LucideIcons from "lucide-react";

export function getLucideIcon(iconName) {
  return LucideIcons[iconName] || LucideIcons.HelpCircle; 
}
