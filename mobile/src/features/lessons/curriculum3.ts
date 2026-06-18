import type { Track } from './types';
import { CHARTS } from './charts';

// ============================================================================
// ORDER EXECUTION  (free)
// ============================================================================
const EXECUTION: Track = {
  id: 'execution',
  title: 'Order Execution',
  subtitle: 'Orders, spread, leverage, liquidation',
  icon: 'swap-horizontal',
  color: '#41C7E8',
  premium: false,
  lessons: [
    {
      id: 'oe-orders',
      title: 'Order types',
      teach: [
        {
          emoji: '🧾',
          heading: 'Three ways to enter',
          body: 'A market order fills instantly at the current price. A limit order waits to fill at a price you choose (or better). A stop order only triggers once price reaches a level — used for stop-losses and breakout entries.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'Which order fills instantly at the current price?',
          options: ['Market', 'Limit', 'Stop'],
          answer: 0,
          explain: 'A market order takes the best available price right now.',
        },
        {
          kind: 'match',
          prompt: 'Match the order to its behaviour.',
          pairs: [
            { a: 'Market', b: 'Instant fill' },
            { a: 'Limit', b: 'Waits for your price' },
            { a: 'Stop', b: 'Triggers at a level' },
          ],
          explain: 'Market = now, limit = your price, stop = on trigger.',
        },
        {
          kind: 'blank',
          prompt: 'To buy only if price drops to a chosen level, use a ___ order.',
          options: ['limit', 'market', 'trailing'],
          answer: 0,
          explain: 'A buy limit fills at or below your chosen price.',
        },
      ],
    },
    {
      id: 'oe-spread',
      title: 'Spread & slippage',
      teach: [
        {
          emoji: '↔️',
          heading: 'Bid, ask & the gap',
          body: 'The bid is the best price buyers offer; the ask is what sellers want. The gap between them is the spread — a hidden cost on every trade. Slippage is filling at a worse price than expected, common in fast or thin markets.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'The spread is the gap between…',
          options: ['Bid and ask', 'Open and close', 'High and low'],
          answer: 0,
          explain: 'Bid (buyers) vs ask (sellers) — the spread is the gap.',
        },
        {
          kind: 'blank',
          prompt: 'Filling at a worse price than expected is called ___.',
          options: ['slippage', 'spread', 'margin'],
          answer: 0,
          explain: 'Slippage hits hardest in fast or illiquid markets.',
        },
        {
          kind: 'choice',
          prompt: 'Spreads tend to be widest when…',
          options: ['Markets are fast or thin', 'Markets are calm', 'Never'],
          answer: 0,
          explain: 'Low liquidity / high volatility widens the spread.',
        },
      ],
    },
    {
      id: 'oe-spotfutures',
      title: 'Spot vs futures',
      teach: [
        {
          emoji: '⚖️',
          heading: 'Own it, or trade its price',
          body: 'Spot means you own the actual asset. Futures are leveraged contracts on its price — you don’t hold the coin, you trade where it goes. Arena’s competitions are virtual futures-style trading.',
        },
      ],
      exercises: [
        {
          kind: 'match',
          prompt: 'Match the market to what you hold.',
          pairs: [
            { a: 'Spot', b: 'You own the asset' },
            { a: 'Futures', b: 'A leveraged price contract' },
          ],
          explain: 'Spot = ownership, futures = a contract on the price.',
        },
        {
          kind: 'choice',
          prompt: 'Leverage is typically used in…',
          options: ['Futures', 'Spot only', 'Neither'],
          answer: 0,
          explain: 'Futures let you control more with less via leverage.',
        },
        {
          kind: 'blank',
          prompt: 'In futures you trade the price without ___ the asset.',
          options: ['owning', 'selling', 'seeing'],
          answer: 0,
          explain: 'No ownership — just exposure to the price move.',
        },
      ],
    },
    {
      id: 'oe-perps',
      title: 'Perpetuals & funding',
      teach: [
        {
          emoji: '♾️',
          heading: 'Futures with no expiry',
          body: 'A "perp" is a futures contract that never expires. To keep its price near spot, a funding rate is paid between traders every few hours: when the perp trades ABOVE spot, funding is positive and longs pay shorts; below spot, shorts pay longs.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'When the perp trades ABOVE spot, positive funding means…',
          options: ['Longs pay shorts', 'Shorts pay longs', 'Nobody pays'],
          answer: 0,
          explain: 'Positive funding charges the crowded long side.',
        },
        {
          kind: 'blank',
          prompt: 'A perpetual future has no ___ date.',
          options: ['expiry', 'funding', 'liquidation'],
          answer: 0,
          explain: 'No expiry — funding keeps it tethered to spot instead.',
        },
        {
          kind: 'choice',
          prompt: 'Funding rates exist to…',
          options: ['Keep the perp price near spot', 'Increase leverage', 'Remove fees'],
          answer: 0,
          explain: 'They balance demand so the perp tracks spot.',
        },
      ],
    },
    {
      id: 'oe-liquidation',
      title: 'Liquidation',
      teach: [
        {
          heading: 'When the position gets force-closed',
          body: 'With leverage, if the market moves against you enough that your margin can’t cover the loss, the exchange force-closes the trade at the "liquidation price". Higher leverage = a closer liquidation = less room to be wrong.',
          chart: CHARTS.liquidation,
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'Higher leverage moves your liquidation price…',
          options: ['Closer to entry', 'Further away', 'It doesn’t move'],
          answer: 0,
          explain: 'More leverage = tighter liquidation = less room.',
        },
        {
          kind: 'blank',
          prompt: 'Liquidation happens when your ___ can no longer cover the loss.',
          options: ['margin', 'profit', 'spread'],
          answer: 0,
          explain: 'Once margin is exhausted, the position is closed.',
        },
        {
          kind: 'choice',
          prompt: 'The safest way to avoid liquidation is…',
          options: ['Lower leverage + a stop-loss', 'Max leverage', 'No stop-loss'],
          answer: 0,
          explain: 'A stop-loss closes you before liquidation ever hits.',
        },
      ],
    },
  ],
};

// ============================================================================
// TRADING STYLES  (free)
// ============================================================================
const STYLES: Track = {
  id: 'styles',
  title: 'Trading Styles',
  subtitle: 'Scalp, day, swing, position — and timing',
  icon: 'time',
  color: '#E0A91F',
  premium: false,
  lessons: [
    {
      id: 'ts-styles',
      title: 'Four speeds',
      teach: [
        {
          emoji: '🏎️',
          heading: 'Pick your tempo',
          body: 'Scalping: seconds to minutes, tiny moves, many trades. Day trading: in and out within the day. Swing trading: days to weeks. Position trading: months or longer, riding the big trend.',
        },
      ],
      exercises: [
        {
          kind: 'order',
          prompt: 'Order the styles fastest → slowest.',
          items: ['Scalping (minutes)', 'Day trading (hours)', 'Swing (days–weeks)', 'Position (months)'],
          explain: 'From seconds-long scalps to months-long positions.',
        },
        {
          kind: 'match',
          prompt: 'Match the style to its hold time.',
          pairs: [
            { a: 'Scalping', b: 'Minutes' },
            { a: 'Swing', b: 'Days to weeks' },
            { a: 'Position', b: 'Months+' },
          ],
          explain: 'Hold time grows from scalp to position.',
        },
        {
          kind: 'choice',
          prompt: 'Which style needs the most screen time?',
          options: ['Scalping', 'Position', 'Swing'],
          answer: 0,
          explain: 'Scalping demands constant, fast attention.',
        },
      ],
    },
    {
      id: 'ts-mtf',
      title: 'Multi-timeframe',
      teach: [
        {
          emoji: '🔭',
          heading: 'Two timeframes',
          body: 'Pros use a higher timeframe for DIRECTION (the bias) and a lower timeframe to TIME the entry. Trade in the direction of the higher timeframe and you stack the odds in your favour.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'The higher timeframe gives you…',
          options: ['Direction / bias', 'The exact entry', 'The spread'],
          answer: 0,
          explain: 'HTF = the trend you should trade with.',
        },
        {
          kind: 'blank',
          prompt: 'The lower timeframe is used to ___ your entry.',
          options: ['time', 'ignore', 'widen'],
          answer: 0,
          explain: 'LTF refines exactly when to get in.',
        },
        {
          kind: 'choice',
          prompt: 'Best practice is to trade…',
          options: ['With the higher-timeframe trend', 'Against it', 'Randomly'],
          answer: 0,
          explain: 'Aligning timeframes stacks probability in your favour.',
        },
      ],
    },
    {
      id: 'ts-sessions',
      title: 'Trading sessions',
      teach: [
        {
          emoji: '🕛',
          heading: 'When the market wakes up',
          body: 'Markets run in sessions: Asia (Tokyo), then London, then New York. The London–New York overlap (≈13:00–17:00 UTC) carries the highest volume and volatility — prime hunting hours.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'The most volatile window is usually the…',
          options: ['London–New York overlap', 'Late Asia session', 'Weekend'],
          answer: 0,
          explain: 'The overlap concentrates the most liquidity.',
        },
        {
          kind: 'blank',
          prompt: 'The three main sessions are Asia, London and ___.',
          options: ['New York', 'Berlin', 'Cairo'],
          answer: 0,
          explain: 'New York is the third major session.',
        },
        {
          kind: 'match',
          prompt: 'Match the session to its character.',
          pairs: [
            { a: 'Asia', b: 'Lower volatility' },
            { a: 'London/NY overlap', b: 'Highest volatility' },
          ],
          explain: 'Asia is quieter; the overlap is the storm.',
        },
      ],
    },
    {
      id: 'ts-yourstyle',
      title: 'Find your style',
      teach: [
        {
          emoji: '🧭',
          heading: 'Fit it to your life',
          body: 'The best style is the one that fits your schedule and temperament. Busy day job? Swing or position trading. Love fast action and can watch screens? Scalping or day trading. There’s no "best" — only what you can do consistently.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'The best trading style is…',
          options: ['The one you can do consistently', 'Always scalping', 'Always position'],
          answer: 0,
          explain: 'Consistency beats any "optimal" style.',
        },
        {
          kind: 'choice',
          prompt: 'Someone with a busy day job suits…',
          options: ['Swing / position trading', 'Scalping', '1-minute charts'],
          answer: 0,
          explain: 'Longer holds need less screen time.',
        },
        {
          kind: 'blank',
          prompt: 'Consistency matters more than the ___ you pick.',
          options: ['style', 'broker', 'coin'],
          answer: 0,
          explain: 'Execution > the label on your approach.',
        },
      ],
    },
  ],
};

// ============================================================================
// VOLUME PROFILE & VWAP  (premium)
// ============================================================================
const VOLUME: Track = {
  id: 'volume',
  title: 'Volume Profile & VWAP',
  subtitle: 'Read where the real trading happened',
  icon: 'cellular',
  color: '#5646C4',
  premium: true,
  lessons: [
    {
      id: 'vp-volume',
      title: 'Volume is fuel',
      teach: [
        {
          emoji: '🔊',
          heading: 'Conviction behind the move',
          body: 'Volume measures how much traded in a period. Moves on high volume have conviction; moves on low volume are suspect. Volume confirms breakouts and warns when a trend is running out of gas.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'A breakout on high volume is…',
          options: ['More trustworthy', 'Less trustworthy', 'Irrelevant'],
          answer: 0,
          explain: 'Volume shows real participation behind the break.',
        },
        {
          kind: 'blank',
          prompt: 'Rising price on falling volume warns the trend may be ___.',
          options: ['weakening', 'accelerating', 'starting'],
          answer: 0,
          explain: 'Fading volume = fading conviction.',
        },
        {
          kind: 'choice',
          prompt: 'Volume measures…',
          options: ['How much was traded', 'The price', 'The spread'],
          answer: 0,
          explain: 'It’s the quantity transacted, not the price.',
        },
      ],
    },
    {
      id: 'vp-vwap',
      title: 'VWAP',
      teach: [
        {
          emoji: '📊',
          heading: 'The session’s fair value',
          body: 'VWAP is the Volume-Weighted Average Price — the average price weighted by volume across the session. Institutions use it as a benchmark: price above VWAP = buyers in control; below = sellers. It often acts as dynamic support/resistance.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'Price above VWAP suggests…',
          options: ['Buyers in control', 'Sellers in control', 'Nothing'],
          answer: 0,
          explain: 'Above the volume-weighted mean = bullish bias.',
        },
        {
          kind: 'blank',
          prompt: 'VWAP weights price by ___.',
          options: ['volume', 'time', 'spread'],
          answer: 0,
          explain: 'More volume at a price pulls VWAP toward it.',
        },
        {
          kind: 'choice',
          prompt: 'Institutions use VWAP as a…',
          options: ['Benchmark for fair value', 'Stop-loss', 'Leverage tool'],
          answer: 0,
          explain: 'They measure their fills against VWAP.',
        },
      ],
    },
    {
      id: 'vp-profile',
      title: 'Volume profile',
      teach: [
        {
          emoji: '📶',
          heading: 'Volume by price, not time',
          body: 'Instead of volume over time, a volume profile shows volume at each PRICE — a sideways histogram. Fat areas are where lots of trading happened (agreement); thin areas are where price moved fast.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'A volume profile shows volume by…',
          options: ['Price level', 'Time only', 'Date'],
          answer: 0,
          explain: 'It maps how much traded at each price.',
        },
        {
          kind: 'blank',
          prompt: 'Thin areas on the profile are where price moved ___.',
          options: ['fast', 'slow', 'never'],
          answer: 0,
          explain: 'Little trading = price slipped through quickly.',
        },
        {
          kind: 'choice',
          prompt: 'Fat areas on the profile mean…',
          options: ['Lots of trading / agreement', 'No trading', 'A breakout'],
          answer: 0,
          explain: 'Heavy volume = a price the market agreed on.',
        },
      ],
    },
    {
      id: 'vp-poc',
      title: 'POC & Value Area',
      teach: [
        {
          heading: 'The magnet and the range',
          body: 'The Point of Control (POC) is the single price with the most volume — a magnet for price. The Value Area is the range holding ~70% of volume (bounded by VAH and VAL). Price spends most of its time inside the value area.',
          chart: CHARTS.valueArea,
        },
      ],
      exercises: [
        {
          kind: 'blank',
          prompt: 'The single highest-volume price is the ___.',
          options: ['POC', 'VWAP', 'VAH'],
          answer: 0,
          explain: 'Point of Control = the most-traded price.',
        },
        {
          kind: 'choice',
          prompt: 'The Value Area holds about ___ % of volume.',
          options: ['70', '20', '100'],
          answer: 0,
          explain: 'The value area captures ~70% of the volume.',
        },
        {
          kind: 'choice',
          prompt: 'The POC tends to act like a…',
          options: ['Magnet for price', 'Stop-loss', 'Random level'],
          answer: 0,
          explain: 'Price is drawn back to the high-volume POC.',
        },
      ],
    },
    {
      id: 'vp-nodes',
      title: 'HVN & LVN',
      teach: [
        {
          emoji: '🧱',
          heading: 'Shelves and gaps',
          body: 'A High-Volume Node (HVN) is a price shelf where lots traded — strong support/resistance. A Low-Volume Node (LVN) is a gap with little trading — price tends to slice straight through it.',
        },
      ],
      exercises: [
        {
          kind: 'match',
          prompt: 'Match the node to its behaviour.',
          pairs: [
            { a: 'HVN', b: 'Strong support/resistance' },
            { a: 'LVN', b: 'Price slices through' },
          ],
          explain: 'High volume holds; low volume gets crossed fast.',
        },
        {
          kind: 'blank',
          prompt: 'Price moves quickly through a ___ (low-volume node).',
          options: ['LVN', 'HVN', 'POC'],
          answer: 0,
          explain: 'Little agreement there, so price hurries through.',
        },
        {
          kind: 'choice',
          prompt: 'An HVN acts as…',
          options: ['Support / resistance', 'A fast-move zone', 'A funding rate'],
          answer: 0,
          explain: 'A thick volume shelf resists price.',
        },
      ],
    },
  ],
};

export const FREE_EXTRA3: Track[] = [EXECUTION, STYLES];
export const PREMIUM_EXTRA3: Track[] = [VOLUME];
