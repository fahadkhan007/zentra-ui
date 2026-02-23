import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["Trusted", "Knowledgeable", "Helpful", "Accurate", "Reliable"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full">
      <div className="container mx-auto mt-20">
        <div className="flex gap-8 py-8 lg:py-16 items-center justify-center flex-col">
          <div>
            <Button asChild variant="secondary" size="sm" className="gap-4">
              <a
                href="https://www.who.int/publications/i/item/9789240015128"
                target="_blank"
                rel="noopener noreferrer"
              >
                Sourced from WHO <MoveRight className="w-4 h-4" />
              </a>
            </Button>
          </div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
              <span className="text-spektr-cyan-50">Your AI Health Assistant,</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                          y: 0,
                          opacity: 1,
                        }
                        : {
                          y: titleNumber > index ? -150 : 150,
                          opacity: 0,
                        }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
              Zentra is an AI-powered chatbot that answers your health questions using verified information from the World Health Organization.
              Get reliable health guidance, anytime.
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <Button asChild size="lg" className="gap-4" variant="outline">
              <Link to="/login">Login <MoveRight className="w-4 h-4" /></Link>
            </Button>
            <Button asChild size="lg" className="gap-4">
              <Link to="/register">Get started <MoveRight className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
