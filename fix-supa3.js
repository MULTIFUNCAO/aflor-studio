var fs = require('fs');
var c = fs.readFileSync('index.html', 'utf8');

var oldKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xd3picGluaGtneGZib2V1cnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NjkwMTIsImV4cCI6MjA1OTU0NTAxMn0.N-bQoXbRHZMVPCOI0cQmouQ5aTFT0JW-QS1Nz3Qeyos';
var newKey = 'sb_publishable_zKf6ZHKkhsPFbtuAH-nbQQ_-z5C0MIF';

c = c.split(oldKey).join(newKey);
fs.writeFileSync('index.html', c);
console.log('ok:', c.includes(newKey));
