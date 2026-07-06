const fs = require('fs');
let content = fs.readFileSync('src/components/Consumptions.tsx', 'utf-8');

// Replace "bg-white shadow-sm" with "bg-white" and add style={shadowStyle} 
// but it's tricky because it's inside template literals.

// Actually, I can just use a simple regex for the ones on Pressable.
content = content.replace(/className=\{`px-2 py-0.5 rounded-md \$\{reportType === "Monthly" \? "bg-white shadow-sm" : ""\}`\}/g,
  'className={`px-2 py-0.5 rounded-md ${reportType === "Monthly" ? "bg-white" : ""}`} style={reportType === "Monthly" ? shadowStyle : undefined}');

content = content.replace(/className=\{`px-2 py-0.5 rounded-md \$\{reportType === "Yearly" \? "bg-white shadow-sm" : ""\}`\}/g,
  'className={`px-2 py-0.5 rounded-md ${reportType === "Yearly" ? "bg-white" : ""}`} style={reportType === "Yearly" ? shadowStyle : undefined}');

content = content.replace(/className=\{`px-3 py-1.5 rounded-md \$\{reportType === "Monthly" \? "bg-white shadow-sm" : ""\}`\}/g,
  'className={`px-3 py-1.5 rounded-md ${reportType === "Monthly" ? "bg-white" : ""}`} style={reportType === "Monthly" ? shadowStyle : undefined}');

content = content.replace(/className=\{`px-3 py-1.5 rounded-md \$\{reportType === "Yearly" \? "bg-white shadow-sm" : ""\}`\}/g,
  'className={`px-3 py-1.5 rounded-md ${reportType === "Yearly" ? "bg-white" : ""}`} style={reportType === "Yearly" ? shadowStyle : undefined}');

content = content.replace(/className=\{`px-4 py-2 rounded-lg \$\{selectedPeriod === period \? "bg-white shadow-sm" : ""\}`\}/g,
  'className={`px-4 py-2 rounded-lg ${selectedPeriod === period ? "bg-white" : ""}`} style={selectedPeriod === period ? shadowStyle : undefined}');

content = content.replace(/className="bg-slate-950 px-6 py-3.5 rounded-xl flex-row items-center gap-2 shadow-sm active:bg-slate-800"/g,
  'className="bg-slate-950 px-6 py-3.5 rounded-xl flex-row items-center gap-2 active:bg-slate-800" style={shadowStyle}');

// Add the shadowStyle definition after imports
content = content.replace(/import \{ Feather, Ionicons \} from "@expo\/vector-icons";/, 
`import { Feather, Ionicons } from "@expo/vector-icons";

const shadowStyle = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 2,
};`);

fs.writeFileSync('src/components/Consumptions.tsx', content);
