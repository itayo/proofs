
mods = [
  require('./web_service')
  require('./util')
  require('./alloc')
  require('./constants')
  require('./base')
  require('./track')
  require('./auth')
  require('./device')
  require('./revoke')
  require('./cryptocurrency')
  require('./subkey')
  require('./sibkey')
  require('./eldest')
  require('./announcement')
  require('./scrapers/twitter')
  require('./scrapers/github')
  require('./scrapers/reddit')
  require('./scrapers/generic_web_site')
  require('./scrapers/dns')
  require('./scrapers/coinbase')
  require('./scrapers/hackernews')
]

for m in mods
  for k,v of m
    exports[k] = v
