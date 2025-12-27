const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '.expo', 'settings.json');

try {
  if (fs.existsSync(settingsPath)) {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    console.log('\n---------------------------------------------------');
    console.log('YOUR TUNNEL URL IS:');
    console.log(`exp://${settings.urlRandomness}.anonymous.mobile.exp.direct:80`);
    console.log('---------------------------------------------------\n');
  } else {
    console.log("Could not find .expo/settings.json");
  }
} catch (e) {
  console.error(e);
}

