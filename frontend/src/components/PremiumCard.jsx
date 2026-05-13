import { motion } from "framer-motion";

export default function PremiumCard({ children, className = "" }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      className={`glass premium-shadow rounded-3xl p-5 ${className}`}
    >
      {children}
    </motion.div>
  );
}