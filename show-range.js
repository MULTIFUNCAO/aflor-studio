var fs=require('fs');var c=fs.readFileSync('index.html','utf8');var lines=c.split('\n');console.log(lines.slice(8430,8475).join('\n'));
