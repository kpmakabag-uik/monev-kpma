const fs = require('fs');

let sql = fs.readFileSync('fresh_dump.sql', 'utf8');

const tableMappings = {
  '`account`': '`Account`',
  '`session`': '`Session`',
  '`user`': '`User`',
  '`verificationtoken`': '`VerificationToken`',
  '`level`': '`Level`',
  '`setting`': '`Setting`',
  '`cycle`': '`Cycle`',
  '`document`': '`Document`',
  '`faculty`': '`Faculty`',
  '`prodi`': '`Prodi`',
  '`instrument`': '`Instrument`',
  '`monevrecord`': '`MonevRecord`',
  '`_prisma_migrations`': '`_prisma_migrations`'
};

for (const [lower, correct] of Object.entries(tableMappings)) {
  sql = sql.replace(new RegExp(lower, 'g'), correct);
}

fs.writeFileSync('fresh_dump_fixed.sql', sql);
console.log('Fixed table names case in SQL dump.');
