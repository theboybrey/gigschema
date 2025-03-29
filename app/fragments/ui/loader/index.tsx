import { RiLoader5Line } from "@remixicon/react";
import { motion } from "framer-motion";

const LoaderFragment = () => {
  const shimmer = {
    animate: {
      backgroundPosition: ["100% 0", "-100% 0"],
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: "linear"
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[999999] overflow-hidden">

      {/* Main Content */}
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 mb-12"
        >
          <p className="text-2xl font-syne font-medium text-muted-foreground">
            Gigschema
          </p>
        </motion.div>

        {/* Skeleton Loading Content */}
        <div className="w-full max-w-4xl">
          {/* Services Section */}
          <div className="mb-8">
            <motion.div
              variants={shimmer}
              animate="animate"
              className="h-8 w-48 mb-4 rounded-lg bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%]"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl overflow-hidden"
                >
                  <motion.div
                    variants={shimmer}
                    animate="animate"
                    className="h-32 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%]"
                  />
                  <motion.div
                    variants={shimmer}
                    animate="animate"
                    className="h-4 w-3/4 mt-2 rounded-md bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%]"
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Orders Section */}
          <div className="space-y-4">
            <motion.div
              variants={shimmer}
              animate="animate"
              className="h-8 w-40 rounded-lg bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%]"
            />
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-100"
              >
                <motion.div
                  variants={shimmer}
                  animate="animate"
                  className="w-16 h-16 rounded-lg bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%]"
                />
                <div className="flex-1 space-y-2">
                  <motion.div
                    variants={shimmer}
                    animate="animate"
                    className="h-4 w-1/3 rounded-md bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%]"
                  />
                  <motion.div
                    variants={shimmer}
                    animate="animate"
                    className="h-4 w-1/4 rounded-md bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%]"
                  />
                </div>
                <motion.div
                  variants={shimmer}
                  animate="animate"
                  className="w-20 h-8 rounded-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%]"
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4 -mt-6 justify-center flex flex-col items-center gap-2">
          <div className="">
            <RiLoader5Line className="animate-spin text-gray-300" size={32} />
          </div>

          <p className="text-sm text-muted-foreground animate-pulse">Thanks for your patience, we&apos;re loading some contents.</p>
        </div>
      </div>
    </div>
  );
};

export default LoaderFragment;
