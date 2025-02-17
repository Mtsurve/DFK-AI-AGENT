import React, { useState } from "react";
import { HiMiniHeart } from "react-icons/hi2";
import { TbBallBowling } from "react-icons/tb";

interface ProgressBarProps {
  value: number;
  target?: number;
  label: string;
  color: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  target,
  label,
  color,
}) => {
  const percentage = target ? (value / target) * 100 : value;

  return (
    <div className="flex flex-col mx-2">
      <div className="flex justify-between">
        <p className="text-sm font-semibold dark:text-white text-gray-900">
          {label}
        </p>
        <p className="text-sm dark:text-white text-gray-900">
          {value}
          {target ? `/${target}` : "%"}
        </p>
      </div>
      <div className="dark:bg-gray-700 bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${color}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

interface CardProps {
  hero: {
    id: string | number;
    name: string;
    image: string;
    class: string;
    sub_class: string;
    rarity: string;
    level: number;
    generation: number;
    stamina: number;
    summons: number;
    xp: number;
    hp: number | string;
    mp: number | string;
    strength: number;
    dexterity: number;
    agility: number;
    vitality: number;
    endurance: number;
    intelligence: number;
    wisdom: number;
    luck: number;
    mining: number;
    gardening: number;
    fishing: number;
    foraging: number;
  };
}

interface StatsSectionProps {
  title: string;
  stats: Array<{ label: string; value: number }>;
}

const StatsSection: React.FC<StatsSectionProps> = ({ title, stats }) => (
  <div className="mb-4">
    <h4 className="text-md font-semibold justify-center flex mb-2 dark:text-white border-b dark:border-gray-700 pb-1">
      {title}
    </h4>
    <ul className="space-y-1 text-sm text-gray-800 dark:text-gray-200">
      {stats.map(({ label, value }) => (
        <li key={label} className="flex justify-between">
          <strong>{label}</strong> {value}
        </li>
      ))}
    </ul>
  </div>
);

const Card: React.FC<CardProps> = ({ hero }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="w-full max-w-[320px] sm:max-w-[320px] prespective rounded-lg cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`relative w-full h-[500px] border-gray-500 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 rounded-lg transition-transform duration-500 transform-style-preserve-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        <div className="absolute w-full h-full backface-hidden px-2">
          <img
            loading="lazy"
            className="w-full h-40 sm:h-48 object-cover rounded-lg"
            src={hero.image}
            alt={`${hero.name}`}
          />
          <div className="mt-3 text-center border-b-2 dark:border-gray-700 border-gray-200 pb-2">
            <h3 className="text-lg font-bold tracking-wider dark:text-white text-gray-900">
              {hero.name}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ID: #{hero.id}
            </span>
          </div>

          <div className="mt-3 flex justify-between">
            <div>
              <h2 className="text-base font-bold dark:text-white text-gray-900">
                {hero.class}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {hero.sub_class}
              </p>
            </div>
            <div>
              <p className="text-sm dark:text-white text-gray-900">
                Level: {hero.level}
              </p>
              <p className="text-sm dark:text-white text-gray-900">
                Gen: {hero.generation}
              </p>
            </div>
          </div>

          <div className="space-y-2 mt-3">
            <ProgressBar
              value={hero.summons}
              target={100}
              label="Summons"
              color="bg-yellow-500"
            />
            <ProgressBar
              value={hero.stamina}
              target={100}
              label="Stamina"
              color="bg-green-500"
            />
            <ProgressBar
              value={hero.xp}
              target={1000}
              label="XP"
              color="bg-blue-500"
            />
          </div>

          <div className="flex justify-between mt-3 text-sm font-medium dark:text-white text-gray-900">
            <div className="flex items-center gap-1">
              <HiMiniHeart className="text-red-500" />
              {hero.hp}
            </div>
            <div className="flex items-center gap-1">
              <TbBallBowling className="text-blue-500" />
              {hero.mp}
            </div>
          </div>
        </div>
        <div className="absolute w-full h-full backface-hidden rotate-y-180 p-4">
          <h3 className="text-xl font-bold text-center mb-4 dark:text-white">
            More Details
          </h3>
          <StatsSection
            title="Basic Info"
            stats={[
              { label: "Strength", value: hero.strength },
              { label: "Dexterity", value: hero.dexterity },
              { label: "Agility", value: hero.agility },
              { label: "Vitality", value: hero.vitality },
              { label: "Endurance", value: hero.endurance },
              { label: "Intelligence", value: hero.intelligence },
              { label: "Wisdom", value: hero.wisdom },
              { label: "Luck", value: hero.luck },
            ]}
          />
          <StatsSection
            title="Professions"
            stats={[
              { label: "Mining", value: hero.mining },
              { label: "Gardening", value: hero.gardening },
              { label: "Fishing", value: hero.fishing },
              { label: "Foraging", value: hero.foraging },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default Card;
