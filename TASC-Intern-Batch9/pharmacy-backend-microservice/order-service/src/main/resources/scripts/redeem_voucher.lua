if redis.call('exists', KEYS[3]) == 1 then return -4 end

if redis.call('exists', KEYS[1]) == 0 then return -3 end

if redis.call('sismember', KEYS[2], ARGV[1]) == 1 then return -2 end

local stock = tonumber(redis.call('get', KEYS[1]))
if stock <= 0 then return -1 end

redis.call('decr', KEYS[1])
redis.call('sadd', KEYS[2], ARGV[1])
redis.call('setex', KEYS[3], 1, 'lock')
redis.call('expire', KEYS[2], 259200)
return 1