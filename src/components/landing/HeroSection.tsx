﻿"use client";

import {
  LandingBlocksWelcomeHero,
  LandingQuery,
} from "@/tina/__generated__/types";
import { useRouter } from "next/navigation";
import React from "react";
import { tinaField, useTina } from "tinacms/dist/react";
import { TinaMarkdown } from "tinacms/dist/rich-text";

type Props = LandingBlocksWelcomeHero & {
  cmsQuery?: any;
  handleCallToActionClick?: () => void;
};

const HeroSection: React.FC<Props> = (props) => {
  const router = useRouter();
  // Re-hydrate Tina content on client (only in edit mode)
  const { data } = useTina<LandingQuery>(props.cmsQuery || {});
  const heroBlock =
    data?.landing?.blocks?.find(
      (b) => b?.__typename === "LandingBlocksWelcomeHero"
    ) || props;

  const { backgroundImage, message, buttonLink, buttonText } = heroBlock;

  const handleButtonClick = (buttonLink: string) => () => {
    if (props.handleCallToActionClick) {
      props.handleCallToActionClick();
    } else if (buttonLink) {
      router.push(buttonLink);
    }
  };

  return (
    <section
      className="relative w-full mx-auto overflow-hidden shadow-lg bg-white h-svh"
      id="hero-section"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        data-tina-field={tinaField(heroBlock, "backgroundImage")}
        style={{ backgroundImage: `url('${backgroundImage}')` }}
      />
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative flex flex-col justify-end items-start pb-10 h-full px-8 sm:px-16 text-white z-10">
        <div className="w-full sm:max-w-[50%]">
          <div data-tina-field={tinaField(heroBlock, "message")}>
            <TinaMarkdown
              content={message}
              components={{
                h1: (p: any) => (
                  <h1
                    className="text-3xl sm:text-5xl font-bold leading-snug break-words"
                    {...p}
                  />
                ),
                p: (p: any) => (
                  <p className="text-lg mt-4 break-words" {...p} />
                ),
                break: () => <br />,
              }}
            />
          </div>

          {buttonText && (
            <div className="mt-8">
              <span
                onClick={handleButtonClick(buttonLink)}
                data-tina-field={tinaField(heroBlock, "buttonText")}
                className="bg-red-600 hover:bg-red-500 text-nowrap text-white font-semibold px-10 py-3 shadow-md cursor-pointer"
              >
                {buttonText}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
