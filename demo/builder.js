import { VERSION } from "./dist/index.js";
import { HikidashiFurigana, HikidashiEra, HikidashiNumerals, HIKIDASHI_EMBED_OPTION_KEYS } from "./dist/element.js";
import "./dist/element-define.js";
import { familyEmbedBuilder, FAMILY_EMBED_BUILDER_WORDS } from "./family-embed-builder.js";
const words={en:{...FAMILY_EMBED_BUILDER_WORDS.en,pageDocs:"Docs",pageApi: "API",pitch:"Choose furigana, an era year or Japanese numerals, preview it and copy its embed code.",name:"Hikidashi means drawer in Japanese.",nameLink:"About the name",foot:"The setup is in the link. No personal data is stored.",toGallery:"The Japanese text tools",makerFurigana:"Furigana",makerFuriganaSays:"A reading shared over the kanji of a word.",makerEra:"An era year",makerEraSays:"A date or year written in a Japanese era.",makerNumerals:"Japanese numerals",makerNumeralsSays:"Write, read aloud or parse a Japanese number.",copyLink:"Copy a link to this text tool"},ja:{...FAMILY_EMBED_BUILDER_WORDS.ja,pageDocs:"ドキュメント",pageApi:"API（英語）",pitch:"ふりがな、和暦、漢数字を選び、プレビューを確認して、ページに埋め込むコードをコピーできます。",name:"「引き出し」は英語のdrawerに当たる日本語です。",nameLink:"名前について",foot:"設定はリンクに入ります。個人情報は保存しません。",toGallery:"日本語のテキストツール",makerFurigana:"ふりがな",makerFuriganaSays:"単語の読みを漢字に割り当てます。",makerEra:"和暦",makerEraSays:"日付や年を和暦で表示します。",makerNumerals:"漢数字",makerNumeralsSays:"漢数字を書き、読み、数値に変換します。",copyLink:"このテキストツールへのリンクをコピー"}};
const row=(id,kind,names,en,ja,extra={})=>({id,kind,group:"input",names,say:{en:{label:en[0],help:en[1]},ja:{label:ja[0],help:ja[1]}},...extra});
const all=name=>({furigana:name,era:name,numerals:name});
const options=[
row("text","text",{furigana:"text"},["Word","The word to annotate."],["単語","ふりがなを付ける単語です。"],{default:"食べる"}),
row("reading","text",{furigana:"reading"},["Reading","The word's full reading in kana."],["読み","単語全体の読みをかなで指定します。"],{default:"たべる"}),
row("era-value","text",{era:"value"},["Date or year","YYYY-MM-DD, a western year or an era year."],["日付または年","YYYY-MM-DD、西暦の年、または和暦の年です。"],{default:"2019-05-01"}),
row("format","choice",{era:"format"},["Format","Japanese or romaji."],["表示形式","日本語またはローマ字です。"],{default:"japanese",choices:["japanese","romaji"],choiceLabels:{ja:{japanese:"日本語",romaji:"ローマ字"}}}),
row("gannen","boolean",{era:"gannen"},["First year","Write the first era year as 元年."],["元年","元号の最初の年を元年と書きます。"],{default:true}),
row("numerals-value","text",{numerals:"value"},["Number","A number or a Japanese or English numeral."],["数","数値、漢数字、または英語の数の表現です。"],{default:"12345"}),
row("mode","choice",{numerals:"mode"},["Conversion","Write Japanese numerals, read in kana or parse a number."],["変換","漢数字、かなの読み、または数値に変換します。"],{default:"write",choices:["write","read","parse"],choiceLabels:{ja:{write:"漢数字",read:"かなの読み",parse:"数値"}}}),
row("formal","boolean",{numerals:"formal"},["Formal numerals","Use contract numerals such as 壱."],["大字","壱など、契約書で使う字にします。"],{default:false}),
row("size","choice",all("size"),["Display size","Small, medium or large."],["表示の大きさ","小・中・大を選びます。"],{group:"look",default:"medium",choices:["small","medium","large"]}),
row("width","number",all("width"),["Width","Pixels, fitting a narrower parent."],["幅","ピクセルで指定します。狭い表示枠にも収まります。"],{group:"look",range:{min:200,max:1000,step:10}}),
row("theme","choice",all("theme"),["Theme","Light, dark or the device's preference."],["配色","明るい配色・暗い配色、または端末の設定に合わせます。"],{group:"look",default:"auto",choices:["auto","light","dark"]}),
row("lang","choice",all("lang"),["Language","The language of spoken text and error messages."],["読み上げる言語","読み上げるテキストとエラーメッセージの言語です。"],{group:"look",choices:["en","ja"]}),
row("label","text",all("label"),["Spoken label","An optional screen-reader label."],["読み上げる名前","スクリーンリーダー用の名前です。指定は任意です。"],{group:"look"}),
];
const leftOut={"mount.onChange":"Callbacks belong to host options; native events carry the same result.","mount.onError":"Callbacks belong to host options; native error events carry the same message."};
let mounted;const page=globalThis.familyLanguage({id:"hikidashi",words,onChange:()=>{docsLink();mounted?.draw();}}),heights={};const key=(maker,settings)=>JSON.stringify([maker,settings]);
const makers={};for(const[name,required]of[["furigana",["text","reading","size"]],["era",["era-value","size"]],["numerals",["numerals-value","size"]]])makers[name]={names:name,element:name,tag:`hikidashi-${name}`,embed:`embed/${name}/`,required,description:`maker${name[0].toUpperCase()+name.slice(1)}Says`,formats:["element","iframe","module","react","vue","svelte","angular","html","url"],width:640,height:settings=>heights[key(name,settings)]??300};
const builder=familyEmbedBuilder({id:"hikidashi",packageName:"@johnmorrisdotca/hikidashi",major:VERSION.split(".")[0],site:"https://johnmorrisdotca.github.io/hikidashi/",title:"Hikidashi · Japanese text tool",titleJa:"日本語テキストツールの埋め込み",options,leftOut,groups:{input:{en:"The text",ja:"テキストの設定"},look:{en:"Presentation",ja:"表示の設定"}},makers,code:({maker,format,settings})=>{if((format==="iframe"||format==="url")&&settings.lang===undefined)return builder.codeFor(maker,format,options,{...settings,lang:page.lang});return undefined;}});
builder.validateCoverage({furigana:HikidashiFurigana.observedAttributes,era:HikidashiEra.observedAttributes,numerals:HikidashiNumerals.observedAttributes,mount:HIKIDASHI_EMBED_OPTION_KEYS});
mounted=builder.mount({words,language:()=>page,initial:{furigana:{text:"食べる",reading:"たべる",size:"medium",lang:page.lang},era:{"era-value":"2019-05-01",size:"medium",lang:page.lang},numerals:{"numerals-value":"12345",size:"medium",lang:page.lang}},renderPreview:({maker,stage,attrs,settings})=>{const element=globalThis.document.createElement(`hikidashi-${maker}`);for(const[name,value]of attrs)element.setAttribute(name,value);const measure=()=>{heights[key(maker,settings)]=Math.ceil(element.getBoundingClientRect().height)+100;mounted?.refreshCode();};element.addEventListener("hikidashi-load",measure);element.addEventListener("hikidashi-error",measure);stage.append(element);return{destroy(){element.remove();}};}});

function docsLink(){document.querySelector('[data-say="pageDocs"]')?.setAttribute("href",page.lang==="ja"?"docs/ja/index.html":"docs/index.html");}
docsLink();
