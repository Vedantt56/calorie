import { rateLimit, ipKeyGenerator } from 'express-rate-limit'

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
})

export const logTextLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => {
    if (req.user) {
      return req.user._id.toString()
    }

    return ipKeyGenerator(req.ip)
  },
  message: 'Too many food logging requests, please slow down',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !req.user,
})