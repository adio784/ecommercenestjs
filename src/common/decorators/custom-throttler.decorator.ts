import { Throttle } from "@nestjs/throttler"


export const StrictThrottle = () => {
    Throttle({
        default: {
            ttl: 60,
            limit: 3
        }
    })
}

// Moderate Throttler
export const ModerateThrottle = () => {
    Throttle({
        default: {
            ttl: 1000,
            limit: 5
        }
    })
}


// Relaxed rate for read operations
export const RelaxedThrottle = () => {
  return Throttle({
    default: {
      ttl: 1000,
      limit: 20,
    },
  });
};