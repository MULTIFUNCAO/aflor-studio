var fs=require('fs');var c=fs.readFileSync('index.html','utf8');var idx=c.indexOf('dataKey=');console.log(JSON.stringify(c.substring(idx,idx+120)));
