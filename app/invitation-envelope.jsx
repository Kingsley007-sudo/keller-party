"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

const eventDetails = [
  "Private event.",
  "Limited access.",
  "Dresscode: Elegant",
  "No photos. No videos.",
  "Entry: 15 CHF"
];

const easeOut = [0.2, 0.74, 0.2, 1];

export default function InvitationEnvelope() {
  const shouldReduceMotion = useReducedMotion();

  const stageVariants = {
    hidden: shouldReduceMotion
      ? { opacity: 1, y: 0, scale: 1 }
      : { opacity: 0, y: 40, scale: 0.96 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: shouldReduceMotion ? 0 : 1.1, ease: easeOut }
    }
  };

  const flapVariants = {
    hidden: {
      opacity: shouldReduceMotion ? 0 : 1,
      y: shouldReduceMotion ? 34 : 0,
      scale: shouldReduceMotion ? 0.92 : 1,
      rotateX: shouldReduceMotion ? 176 : 0
    },
    show: {
      opacity: shouldReduceMotion ? 0 : [1, 1, 0],
      y: shouldReduceMotion ? 34 : [0, 0, 34],
      scale: shouldReduceMotion ? 0.92 : [1, 1, 0.92],
      rotateX: 176,
      transition: {
        rotateX: {
          delay: shouldReduceMotion ? 0 : 0.25,
          duration: shouldReduceMotion ? 0 : 1.45,
          ease: easeOut
        },
        opacity: {
          delay: shouldReduceMotion ? 0 : 5.15,
          duration: shouldReduceMotion ? 0 : 0.8,
          times: [0, 0.2, 1],
          ease: easeOut
        },
        y: {
          delay: shouldReduceMotion ? 0 : 5.15,
          duration: shouldReduceMotion ? 0 : 0.8,
          times: [0, 0.2, 1],
          ease: easeOut
        },
        scale: {
          delay: shouldReduceMotion ? 0 : 5.15,
          duration: shouldReduceMotion ? 0 : 0.8,
          times: [0, 0.2, 1],
          ease: easeOut
        }
      }
    }
  };

  const envelopeVariants = {
    hidden: shouldReduceMotion
      ? { opacity: 0, y: 34, scale: 0.92 }
      : { opacity: 1, y: 0, scale: 1 },
    show: {
      opacity: shouldReduceMotion ? 0 : [1, 1, 0],
      y: shouldReduceMotion ? 34 : [0, 0, 34],
      scale: shouldReduceMotion ? 0.92 : [1, 1, 0.92],
      transition: {
        delay: shouldReduceMotion ? 0 : 5.15,
        duration: shouldReduceMotion ? 0 : 0.8,
        times: [0, 0.35, 1],
        ease: easeOut
      }
    }
  };

  const cardMaskVariants = {
    hidden: shouldReduceMotion
      ? { clipPath: "inset(0px 0px 0px 0px)" }
      : { clipPath: "inset(0px 0px 384px 0px)" },
    show: {
      clipPath: shouldReduceMotion
        ? "inset(0px 0px 0px 0px)"
        : "inset(0px 0px 0px 0px)",
      transition: {
        delay: shouldReduceMotion ? 0 : 5.25,
        duration: shouldReduceMotion ? 0 : 0.7,
        ease: easeOut
      }
    }
  };

  const cardVariants = {
    hidden: shouldReduceMotion
      ? { opacity: 1, y: -18, scale: 1.08 }
      : { opacity: 0, y: 260, scale: 0.96 },
    show: {
      opacity: 1,
      y: shouldReduceMotion ? -18 : [260, 178, 58, 58, -28, -18],
      scale: shouldReduceMotion ? 1.08 : [0.96, 0.96, 0.96, 0.96, 1.12, 1.08],
      transition: {
        opacity: {
          delay: shouldReduceMotion ? 0 : 1.7,
          duration: shouldReduceMotion ? 0 : 0.18
        },
        y: {
          delay: shouldReduceMotion ? 0 : 1.7,
          duration: shouldReduceMotion ? 0 : 4.35,
          times: [0, 0.3, 0.56, 0.76, 0.94, 1],
          ease: easeOut
        },
        scale: {
          delay: shouldReduceMotion ? 0 : 1.7,
          duration: shouldReduceMotion ? 0 : 4.35,
          times: [0, 0.3, 0.56, 0.76, 0.94, 1],
          ease: easeOut
        }
      }
    }
  };

  return (
    <motion.div
      className="scene"
      variants={stageVariants}
      initial="hidden"
      animate="show"
    >
      <div className="halo-ring halo-ring-one" />
      <div className="halo-ring halo-ring-two" />
      <div className="envelope-stage" aria-label="Keller Party invitation">
        <motion.div className="envelope-back" variants={envelopeVariants} />
        <motion.div className="envelope-flap" variants={flapVariants} />
        <motion.div className="card-reveal-mask" variants={cardMaskVariants}>
          <motion.div className="card-frame" variants={cardVariants}>
            <div className="foil foil-top" />
            <div className="foil foil-side" />
            <div className="invite-card">
              <div className="card-topline">
                <p className="event-label">KELLER PARTY</p>
              </div>
              <p className="card-subtitle">Zurich After Dark</p>
              <h2>June 27</h2>
              <p className="location">
                Icon Club, St. Peterstrasse 1, 8001 Zurich
              </p>
              <ul className="details-list">
                {eventDetails.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
              <Link href="/request-access" className="primary-button button-link">
                Request access
              </Link>
            </div>
          </motion.div>
        </motion.div>
        <motion.div className="envelope-pocket" variants={envelopeVariants} />
      </div>
    </motion.div>
  );
}
