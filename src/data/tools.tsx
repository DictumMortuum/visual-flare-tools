
import { 
  AlertTriangle, 
  Calendar, 
  CircleDollarSign, 
  Clock, 
  FileText, 
  Hash, 
  Key, 
  MonitorSmartphone, 
  Percent, 
  QrCode, 
  Terminal,
  MailQuestion,
  Hammer,
  Code,
  Fingerprint,
  Calculator
} from "lucide-react";

export interface ToolDefinition {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
}

export const toolsList: ToolDefinition[] = [
  {
    id: "password-generator",
    title: "Password Generator",
    description: "Generate secure, random passwords with customizable options",
    category: "Security",
    icon: <Key className="h-5 w-5" />,
  },
  {
    id: "uuid-generator",
    title: "UUID Generator",
    description: "Generate v4 UUIDs (Universally Unique Identifiers)",
    category: "Development",
    icon: <Fingerprint className="h-5 w-5" />,
  },
  {
    id: "json-formatter",
    title: "JSON Formatter",
    description: "Format and validate JSON data with syntax highlighting",
    category: "Development",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    id: "base64-encoder",
    title: "Base64 Encoder/Decoder",
    description: "Encode text to Base64 or decode Base64 to text",
    category: "Conversion",
    icon: <Code className="h-5 w-5" />,
  },
  {
    id: "url-encoder",
    title: "URL Encoder/Decoder",
    description: "Encode and decode URL components",
    category: "Web",
    icon: <Terminal className="h-5 w-5" />,
  },
  {
    id: "html-entities",
    title: "HTML Entity Encoder",
    description: "Convert text to HTML entities and vice versa",
    category: "Web",
    icon: <Code className="h-5 w-5" />,
  },
  {
    id: "case-converter",
    title: "Case Converter",
    description: "Convert text between different cases (camel, snake, pascal)",
    category: "Text",
    icon: <Terminal className="h-5 w-5" />,
  },
  {
    id: "color-converter",
    title: "Color Converter",
    description: "Convert between different color formats (HEX, RGB, HSL)",
    category: "Design",
    icon: <Circle className="h-5 w-5" />,
  },
  {
    id: "qr-generator",
    title: "QR Code Generator",
    description: "Generate QR codes from text or URLs",
    category: "Conversion",
    icon: <QrCode className="h-5 w-5" />,
  },
  {
    id: "unit-converter",
    title: "Unit Converter",
    description: "Convert between different units of measurement",
    category: "Calculation",
    icon: <Calculator className="h-5 w-5" />,
  },
  {
    id: "loan-calculator",
    title: "Loan Calculator",
    description: "Calculate loan payments, interest, and amortization schedules",
    category: "Finance",
    icon: <CircleDollarSign className="h-5 w-5" />,
  },
  {
    id: "date-calculator",
    title: "Date Calculator",
    description: "Calculate the difference between dates or add/subtract time",
    category: "Utilities",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    id: "hash-generator",
    title: "Hash Generator",
    description: "Generate hash values for text (MD5, SHA1, SHA256)",
    category: "Security",
    icon: <Hash className="h-5 w-5" />,
  },
  {
    id: "regex-tester",
    title: "Regex Tester",
    description: "Test and debug regular expressions with visual feedback",
    category: "Development",
    icon: <AlertTriangle className="h-5 w-5" />,
  },
  {
    id: "markdown-preview",
    title: "Markdown Preview",
    description: "Live preview of Markdown with syntax highlighting",
    category: "Text",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    id: "percentage-calculator",
    title: "Percentage Calculator",
    description: "Calculate percentages, increases, decreases and proportions",
    category: "Calculation",
    icon: <Percent className="h-5 w-5" />,
  },
  {
    id: "time-zone-converter",
    title: "Time Zone Converter",
    description: "Convert times across different time zones",
    category: "Utilities",
    icon: <Clock className="h-5 w-5" />,
  },
  {
    id: "pixel-converter",
    title: "Pixel Converter",
    description: "Convert between pixels, rem, em, and other CSS units",
    category: "Design",
    icon: <MonitorSmartphone className="h-5 w-5" />,
  },
  {
    id: "cron-expression",
    title: "Cron Expression Generator",
    description: "Create and validate cron expressions for scheduled tasks",
    category: "Development",
    icon: <Terminal className="h-5 w-5" />,
  },
  {
    id: "email-validator",
    title: "Email Validator",
    description: "Validate email addresses and check format compliance",
    category: "Validation",
    icon: <MailQuestion className="h-5 w-5" />,
  },
];

function Circle({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10"></circle>
      <circle cx="12" cy="12" r="6" fill="currentColor" fillOpacity="0.3"></circle>
      <line x1="12" y1="2" x2="12" y2="4"></line>
      <line x1="12" y1="20" x2="12" y2="22"></line>
      <line x1="2" y1="12" x2="4" y2="12"></line>
      <line x1="20" y1="12" x2="22" y2="12"></line>
    </svg>
  );
}
