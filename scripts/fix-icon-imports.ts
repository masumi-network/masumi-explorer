import * as fs from 'fs';
import * as path from 'path';

const iconsDir = path.join(process.cwd(), 'src/components/icons');

const fixIconFile = (filePath: string) => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace import
  content = content.replace(
    /import { SVGProps } from "react-html-props";/,
    'import { SVGProps as ReactSVGProps } from "react";'
  );
  
  // Replace type
  content = content.replace(
    /(const \w+ = \(props: )SVGProps(\) =>)/,
    '$1ReactSVGProps<SVGSVGElement>$2'
  );
  
  // Update SVG attributes
  content = content.replace(
    /<svg[^>]*>/,
    `<svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >`
  );
  
  fs.writeFileSync(filePath, content);
};

// Get all .tsx files in icons directory
const iconFiles = fs.readdirSync(iconsDir)
  .filter(file => file.endsWith('.tsx'))
  .map(file => path.join(iconsDir, file));

// Fix each file
iconFiles.forEach(fixIconFile);

console.log(`Fixed ${iconFiles.length} icon files`); 