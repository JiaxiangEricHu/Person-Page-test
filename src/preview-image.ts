import {design} from "./config";
export function thumbnail(i: number){
 const grid='<path d="M0 30H240M0 60H240M0 90H240M0 120H240M30 0V150M60 0V150M90 0V150M120 0V150M150 0V150M180 0V150M210 0V150" stroke="currentColor" opacity=".08"/>';
 const graphs=[
 '<path d="M24 113H220M31 120V27" opacity=".4"/><path d="M32 97C55 97 54 97 71 96S100 92 112 76S130 39 146 35S177 31 210 31"/><path d="M32 101C70 101 107 100 128 84S162 57 210 52" opacity=".4"/>',
 '<path d="M22 76H45L56 43L71 106L89 37L107 99L120 76H142L149 62L159 91L169 76H218"/><path d="M22 113H218" opacity=".3"/>',
 '<rect x="31" y="52" width="46" height="43"/><rect x="97" y="52" width="46" height="43"/><rect x="163" y="52" width="46" height="43"/><path d="M77 73H97M143 73H163M120 95V116H54V95"/>',
 '<path d="M30 42H210M30 63H210M30 84H210M30 105H210"/><path d="M58 24V124M120 24V124M182 24V124" opacity=".3"/>',
 '<path d="M25 106H215M25 106V25" opacity=".4"/><path d="M30 92Q60 91 82 74T123 54T167 40T209 29"/><circle cx="45" cy="89" r="3"/><circle cx="78" cy="79" r="3"/><circle cx="115" cy="57" r="3"/><circle cx="153" cy="42" r="3"/><circle cx="190" cy="36" r="3"/>',
 '<path d="M32 77H75M75 77L112 39H190M75 77L112 114H190"/><circle cx="32" cy="77" r="8"/><circle cx="120" cy="39" r="8"/><circle cx="120" cy="114" r="8"/><circle cx="198" cy="39" r="8"/><circle cx="198" cy="114" r="8"/>',
 '<path d="M25 103H217M30 113V30" opacity=".4"/><path d="M35 94L68 81L95 87L119 56L147 61L178 37L209 42"/><path d="M35 106L68 99L95 103L119 87L147 90L178 66L209 71" opacity=".4"/>',
 '<path d="M25 76H57V42H92V107H128V42H163V107H198V76H218"/><path d="M25 125H218M25 20H218" opacity=".2"/>',
 '<circle cx="120" cy="74" r="46"/><circle cx="120" cy="74" r="29" opacity=".5"/><path d="M120 18V130M63 74H177" opacity=".35"/><path d="M120 74L155 43M120 74L90 91"/>'
 ];
 return `<svg viewBox="0 0 240 150" xmlns="http://www.w3.org/2000/svg" style="color:${design.placeholder}" aria-hidden="true">${grid}<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round">${graphs[i%graphs.length]}</g><text x="224" y="139" text-anchor="end" font-family="monospace" font-size="9" fill="currentColor" opacity=".5">${String(i+1).padStart(2,'0')} / SAMPLE</text></svg>`;
}