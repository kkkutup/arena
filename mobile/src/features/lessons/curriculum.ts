import type { Track, Lesson, SimpleCandle } from './types';

// Small hand-crafted candle series for the "spot it on the chart" exercises.
const c = (o: number, h: number, l: number, cl: number): SimpleCandle => ({ o, h, l, c: cl });

// ============================================================================
// TRACK 1 — TRADING BASICS  (free)
// The truly fundamental stuff, so the premium tracks feel like a new world.
// ============================================================================
const BASICS: Track = {
  id: 'basics',
  title: 'Trading Basics',
  subtitle: 'Candles, P&L, leverage, SL/TP — start here',
  icon: 'school',
  color: '#17C283',
  premium: false,
  lessons: [
    {
      id: 'b-candle',
      title: 'What is a candle?',
      teach: [
        {
          emoji: '🕯️',
          heading: 'A candle = one slice of time',
          body: 'Each candle shows four prices for a period (1 min, 1 hour, 1 day…): the Open, the High, the Low, and the Close — "OHLC".',
        },
        {
          emoji: '🟩',
          heading: 'Body & wicks',
          body: 'The thick part is the body (Open→Close). The thin lines are wicks (the High and Low extremes). Green = closed up, red = closed down.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'What do the four values of a candle stand for?',
          options: ['Open, High, Low, Close', 'Order, Hold, Limit, Cancel', 'Only the close price'],
          answer: 0,
          explain: 'Every candle encodes Open, High, Low and Close for its time period.',
        },
        {
          kind: 'blank',
          prompt: 'A green (bullish) candle closes ___ than it opened.',
          options: ['higher', 'lower', 'the same'],
          answer: 0,
          explain: 'Green/bullish means the close is above the open.',
        },
        {
          kind: 'chart',
          prompt: 'Tap the bullish (green) candle.',
          chart: {
            candles: [c(100, 101, 97, 98), c(98, 99, 94, 95), c(95, 103, 94, 102), c(102, 103, 100, 101)],
            markers: [
              { index: 1, label: 'A' },
              { index: 2, label: 'B' },
              { index: 3, label: 'C' },
            ],
          },
          options: ['A', 'B', 'C'],
          answer: 1,
          explain: 'Candle B opens at 95 and closes at 102 — a strong green body.',
        },
      ],
    },
    {
      id: 'b-candle-meaning',
      title: 'What a candle tells you',
      teach: [
        {
          emoji: '💪',
          heading: 'Body = conviction',
          body: 'A long body means one side dominated the period. A tiny body means buyers and sellers were balanced (indecision).',
        },
        {
          emoji: '🪤',
          heading: 'Wick = rejection',
          body: 'A long wick shows price went there but got pushed back — the market "rejected" that level.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'A candle with a long lower wick and small body usually signals…',
          options: ['Buyers rejected lower prices', 'A guaranteed crash', 'Nothing at all'],
          answer: 0,
          explain: 'Price dipped, then buyers pushed it back up — a rejection of lows.',
        },
        {
          kind: 'match',
          prompt: 'Match each candle shape to its meaning.',
          pairs: [
            { a: 'Long body', b: 'Strong conviction' },
            { a: 'Tiny body (doji)', b: 'Indecision' },
            { a: 'Long wick', b: 'Rejection of a level' },
          ],
          explain: 'Body size shows conviction; wicks show rejection.',
        },
        {
          kind: 'blank',
          prompt: 'A candle with almost no body is called a ___.',
          options: ['doji', 'hammer', 'engulfing'],
          answer: 0,
          explain: 'A doji has open ≈ close and signals indecision.',
        },
      ],
    },
    {
      id: 'b-trend',
      title: 'Trends & channels',
      teach: [
        {
          emoji: '📈',
          heading: 'Up, down, or sideways',
          body: 'An uptrend makes higher highs and higher lows. A downtrend makes lower highs and lower lows. No clear pattern = ranging.',
        },
        {
          emoji: '🛣️',
          heading: 'A channel',
          body: 'When price bounces between two parallel lines (support below, resistance above), that’s a channel — a road price travels inside.',
        },
      ],
      exercises: [
        {
          kind: 'blank',
          prompt: 'An uptrend is a series of higher highs and higher ___.',
          options: ['lows', 'wicks', 'gaps'],
          answer: 0,
          explain: 'Higher highs AND higher lows define an uptrend.',
        },
        {
          kind: 'order',
          prompt: 'Put these in order for a downtrend (first → last swing).',
          items: ['High', 'Lower high', 'Even lower high'],
          explain: 'A downtrend keeps printing lower highs (and lower lows).',
        },
        {
          kind: 'choice',
          prompt: 'Price bouncing between two parallel lines is a…',
          options: ['Channel', 'Candle', 'Spread'],
          answer: 0,
          explain: 'Parallel support + resistance = a channel.',
        },
      ],
    },
    {
      id: 'b-sr',
      title: 'Support & resistance',
      teach: [
        {
          emoji: '🧱',
          heading: 'Floors and ceilings',
          body: 'Support is a price floor where buyers tend to step in. Resistance is a ceiling where sellers tend to step in.',
        },
        {
          emoji: '🔁',
          heading: 'They can flip',
          body: 'When price breaks above resistance, that old ceiling often becomes the new floor (support) — and vice-versa.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'A level where buyers repeatedly step in is called…',
          options: ['Support', 'Resistance', 'Leverage'],
          answer: 0,
          explain: 'Support is the floor where demand shows up.',
        },
        {
          kind: 'blank',
          prompt: 'Broken resistance often becomes new ___.',
          options: ['support', 'leverage', 'margin'],
          answer: 0,
          explain: 'Old ceilings flip into new floors after a breakout.',
        },
        {
          kind: 'match',
          prompt: 'Match the term to the idea.',
          pairs: [
            { a: 'Support', b: 'Price floor (buyers)' },
            { a: 'Resistance', b: 'Price ceiling (sellers)' },
          ],
          explain: 'Support = floor, resistance = ceiling.',
        },
      ],
    },
    {
      id: 'b-margin',
      title: 'Margin & leverage',
      teach: [
        {
          emoji: '🔑',
          heading: 'Margin = your deposit',
          body: 'Margin is the slice of your money you lock up to open a position. It’s collateral, not a fee.',
        },
        {
          emoji: '⚖️',
          heading: 'Leverage = a multiplier',
          body: '10× leverage lets you control a $1,000 position with $100 of margin. It multiplies BOTH profit and loss — power and risk together.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'With 10× leverage, how much margin controls a $1,000 position?',
          options: ['$100', '$1,000', '$10,000'],
          answer: 0,
          explain: '$1,000 ÷ 10 = $100 of margin.',
        },
        {
          kind: 'blank',
          prompt: 'Leverage multiplies your profit AND your ___.',
          options: ['loss', 'margin', 'spread'],
          answer: 0,
          explain: 'Higher leverage = bigger gains and bigger losses.',
        },
        {
          kind: 'choice',
          prompt: 'Margin is best described as…',
          options: ['Collateral you lock up', 'A trading fee', 'Your total profit'],
          answer: 0,
          explain: 'Margin is the deposit/collateral for the position.',
        },
      ],
    },
    {
      id: 'b-pnl',
      title: 'P&L (profit & loss)',
      teach: [
        {
          emoji: '💵',
          heading: 'P&L = what you made or lost',
          body: 'Profit & Loss is how much a position is up or down. Long: profit when price rises. Short: profit when price falls.',
        },
        {
          emoji: '⏳',
          heading: 'Unrealized vs realized',
          body: 'While a position is open, P&L is "unrealized" (it floats). Once you close, it becomes "realized" and hits your balance.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'You are LONG and price rises. Your P&L is…',
          options: ['Positive', 'Negative', 'Unaffected'],
          answer: 0,
          explain: 'Longs profit when price goes up.',
        },
        {
          kind: 'blank',
          prompt: 'P&L on an open position is called ___ until you close it.',
          options: ['unrealized', 'realized', 'leveraged'],
          answer: 0,
          explain: 'Open = unrealized; closing locks it in as realized.',
        },
        {
          kind: 'choice',
          prompt: 'A SHORT position profits when price…',
          options: ['Falls', 'Rises', 'Stays flat'],
          answer: 0,
          explain: 'Shorts make money as price drops.',
        },
      ],
    },
    {
      id: 'b-sltp',
      title: 'Stop-loss & take-profit',
      teach: [
        {
          emoji: '🛑',
          heading: 'Stop-loss (SL)',
          body: 'An SL auto-closes your trade at a set loss, so a bad trade can’t wipe you out. It’s your safety net.',
        },
        {
          emoji: '🎯',
          heading: 'Take-profit (TP)',
          body: 'A TP auto-closes your trade at a set profit, locking in the win without you watching the screen.',
        },
      ],
      exercises: [
        {
          kind: 'match',
          prompt: 'Match each order to its job.',
          pairs: [
            { a: 'Stop-loss', b: 'Caps your loss' },
            { a: 'Take-profit', b: 'Locks in your gain' },
          ],
          explain: 'SL limits downside; TP secures upside.',
        },
        {
          kind: 'blank',
          prompt: 'The order that protects you from a big loss is the ___.',
          options: ['stop-loss', 'take-profit', 'margin'],
          answer: 0,
          explain: 'The stop-loss is your safety net.',
        },
        {
          kind: 'choice',
          prompt: 'For a LONG, the take-profit sits…',
          options: ['Above the entry', 'Below the entry', 'At the entry'],
          answer: 0,
          explain: 'Longs profit higher, so TP is above entry (SL below).',
        },
      ],
    },
    {
      id: 'b-rr',
      title: 'Risk & reward',
      teach: [
        {
          emoji: '🛡️',
          heading: 'Risk small',
          body: 'Pros risk only 1–2% of their account per trade. Survive the losing streaks and you stay in the game.',
        },
        {
          emoji: '⚖️',
          heading: 'Risk-to-reward (R:R)',
          body: 'R:R compares what you risk to what you aim to win. 1:2 means risking $1 to make $2. With good R:R you can be wrong often and still profit.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'A common max risk per trade is…',
          options: ['1–2% of the account', '50% of the account', '100% of the account'],
          answer: 0,
          explain: 'Risking 1–2% keeps a losing streak survivable.',
        },
        {
          kind: 'blank',
          prompt: 'Risking $1 to make $3 is a risk-to-reward of 1:___.',
          options: ['3', '1', '0'],
          answer: 0,
          explain: '$1 risk : $3 reward = 1:3.',
        },
        {
          kind: 'choice',
          prompt: 'Why does good R:R matter?',
          options: [
            'You can be wrong often and still profit',
            'It removes all risk',
            'It guarantees wins',
          ],
          answer: 0,
          explain: 'With 1:3, a few wins outweigh many small losses.',
        },
      ],
    },
  ],
};

// ============================================================================
// TRACK 2 — ICT / SMART MONEY  (premium)
// ============================================================================
const ICT: Track = {
  id: 'ict',
  title: 'ICT · Smart Money',
  subtitle: 'Liquidity, order blocks, FVGs, BOS/CHoCH',
  icon: 'magnet',
  color: '#6C5CE7',
  premium: true,
  lessons: [
    {
      id: 'i-liquidity',
      title: 'Liquidity',
      teach: [
        {
          emoji: '💧',
          heading: 'Price hunts liquidity',
          body: 'Big institutions need lots of orders to fill. Those orders sit where retail traders cluster stop-losses — just beyond obvious highs and lows.',
        },
        {
          emoji: '🎣',
          heading: 'The stop hunt',
          body: 'Price often spikes past an obvious level to trigger those stops (grabbing liquidity), then reverses in the real direction. Don’t put your stop where everyone else does.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'In ICT, price primarily moves toward…',
          options: ['Liquidity (clusters of orders)', 'Round numbers only', 'Random noise'],
          answer: 0,
          explain: 'The core ICT premise: price seeks liquidity.',
        },
        {
          kind: 'blank',
          prompt: 'A spike past an obvious high that then reverses is a liquidity ___.',
          options: ['sweep', 'channel', 'doji'],
          answer: 0,
          explain: 'That grab-and-reverse is a liquidity sweep (stop hunt).',
        },
        {
          kind: 'choice',
          prompt: 'Where do retail stop-losses usually sit?',
          options: ['Just beyond obvious highs/lows', 'At random prices', 'Never used'],
          answer: 0,
          explain: 'Predictable stops = engineered liquidity for institutions.',
        },
      ],
    },
    {
      id: 'i-orderblock',
      title: 'Order blocks',
      teach: [
        {
          emoji: '🏦',
          heading: 'Footprints of big orders',
          body: 'An order block is the last opposite candle before a strong institutional move — e.g. the last down candle before a sharp rally. Price often returns to it before continuing.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'A bullish order block is usually…',
          options: [
            'The last down candle before a strong up move',
            'The biggest green candle',
            'Any doji',
          ],
          answer: 0,
          explain: 'It marks where institutions loaded longs before the rally.',
        },
        {
          kind: 'chart',
          prompt: 'Tap the bullish order block (last down candle before the rally).',
          chart: {
            candles: [
              c(102, 103, 100, 101),
              c(101, 102, 99, 100),
              c(100, 101, 96, 97),
              c(97, 108, 96, 107),
              c(107, 110, 106, 109),
            ],
            markers: [
              { index: 1, label: 'A' },
              { index: 2, label: 'B' },
              { index: 3, label: 'C' },
            ],
          },
          options: ['A', 'B', 'C'],
          answer: 1,
          explain: 'B is the final down candle right before the big rally — the order block.',
        },
        {
          kind: 'blank',
          prompt: 'Price often ___ to an order block before continuing.',
          options: ['returns', 'never moves', 'gaps away'],
          answer: 0,
          explain: 'Unmitigated order blocks tend to get retested.',
        },
      ],
    },
    {
      id: 'i-fvg',
      title: 'Fair value gaps',
      teach: [
        {
          emoji: '🕳️',
          heading: 'An imbalance',
          body: 'A Fair Value Gap (FVG) is a 3-candle pattern where the middle candle moves so fast it leaves a gap between candle 1’s wick and candle 3’s wick. The market tends to come back and "fill" it.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'A fair value gap is created by…',
          options: [
            'A fast middle candle leaving a 3-candle gap',
            'Two dojis in a row',
            'A slow sideways range',
          ],
          answer: 0,
          explain: 'The aggressive middle candle leaves an imbalance/gap.',
        },
        {
          kind: 'blank',
          prompt: 'Price is often drawn back to ___ a fair value gap.',
          options: ['fill', 'ignore', 'widen'],
          answer: 0,
          explain: 'FVGs usually get filled before the move continues.',
        },
        {
          kind: 'order',
          prompt: 'Order the 3 candles of a bullish FVG (first → last).',
          items: ['Candle 1 (small)', 'Candle 2 (big up, leaves gap)', 'Candle 3 (continues up)'],
          explain: 'The explosive middle candle creates the gap between 1 and 3.',
        },
      ],
    },
    {
      id: 'i-bos-choch',
      title: 'BOS vs CHoCH',
      teach: [
        {
          emoji: '➡️',
          heading: 'Break of Structure (BOS)',
          body: 'A BOS is price breaking a recent high/low in the SAME direction as the trend — it signals continuation.',
        },
        {
          emoji: '🔄',
          heading: 'Change of Character (CHoCH)',
          body: 'A CHoCH is the first break AGAINST the trend — the early warning of a possible reversal.',
        },
      ],
      exercises: [
        {
          kind: 'match',
          prompt: 'Match the term to what it signals.',
          pairs: [
            { a: 'BOS', b: 'Trend continuation' },
            { a: 'CHoCH', b: 'Possible reversal' },
          ],
          explain: 'BOS = continuation, CHoCH = character change (reversal).',
        },
        {
          kind: 'blank',
          prompt: 'The first break against the trend is a ___.',
          options: ['CHoCH', 'BOS', 'FVG'],
          answer: 0,
          explain: 'Change of Character flags a potential reversal.',
        },
        {
          kind: 'choice',
          prompt: 'A break that’s far more reliable is one accompanied by…',
          options: ['Displacement (a strong move)', 'A tiny doji', 'Low volume drift'],
          answer: 0,
          explain: 'Displacement shows real institutional intent behind the break.',
        },
      ],
    },
    {
      id: 'i-premium-discount',
      title: 'Premium & discount',
      teach: [
        {
          emoji: '🏷️',
          heading: 'Buy low, sell high — measured',
          body: 'Draw a range from a swing low to high. The upper half is "premium" (good for selling), the lower half is "discount" (good for buying). The 50% line is equilibrium.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'You want to BUY. Which half of the range is ideal?',
          options: ['Discount (lower half)', 'Premium (upper half)', 'Exactly the high'],
          answer: 0,
          explain: 'Buy in discount, sell in premium.',
        },
        {
          kind: 'blank',
          prompt: 'The 50% level of the range is called ___.',
          options: ['equilibrium', 'liquidity', 'the order block'],
          answer: 0,
          explain: '50% is equilibrium — the fair midpoint.',
        },
        {
          kind: 'match',
          prompt: 'Match the zone to the action.',
          pairs: [
            { a: 'Premium', b: 'Look to sell' },
            { a: 'Discount', b: 'Look to buy' },
          ],
          explain: 'Premium = sell zone, discount = buy zone.',
        },
      ],
    },
    {
      id: 'i-ote-killzone',
      title: 'OTE & kill zones',
      teach: [
        {
          emoji: '🎯',
          heading: 'Optimal Trade Entry (OTE)',
          body: 'After a structure break, the OTE is the 62–79% Fibonacci retracement zone — where risk is small and reward is large.',
        },
        {
          emoji: '🕗',
          heading: 'Kill zones',
          body: 'Institutional activity peaks at certain times: the London and New York session windows. ICT calls these "kill zones" — the best hours to hunt setups.',
        },
      ],
      exercises: [
        {
          kind: 'blank',
          prompt: 'The OTE zone is roughly the 62–___% retracement.',
          options: ['79', '20', '100'],
          answer: 0,
          explain: 'OTE sits in the deep 62–79% retracement.',
        },
        {
          kind: 'choice',
          prompt: '"Kill zones" refer to…',
          options: [
            'High-activity session windows (London/NY)',
            'Dangerous coins',
            'Stop-loss levels',
          ],
          answer: 0,
          explain: 'They are the prime institutional trading hours.',
        },
        {
          kind: 'choice',
          prompt: 'Why enter at OTE?',
          options: ['Small risk, large reward', 'It can’t lose', 'It avoids fees'],
          answer: 0,
          explain: 'Deep retracement = tight stop, big target.',
        },
      ],
    },
  ],
};

// ============================================================================
// TRACK 3 — ELLIOTT WAVE  (premium)
// ============================================================================
const ELLIOTT: Track = {
  id: 'elliott',
  title: 'Elliott Wave',
  subtitle: 'The 5-3 rhythm of the market',
  icon: 'pulse',
  color: '#FF9F0A',
  premium: true,
  lessons: [
    {
      id: 'e-structure',
      title: 'The 5-3 structure',
      teach: [
        {
          emoji: '🌊',
          heading: 'Five up, three back',
          body: 'A full cycle = 5 impulse waves (1-2-3-4-5) in the trend’s direction, then a 3-wave correction (A-B-C) against it.',
        },
        {
          emoji: '🔥',
          heading: 'Wave 3 is the engine',
          body: 'Wave 3 is usually the longest and strongest — the move everyone wants to catch.',
        },
      ],
      exercises: [
        {
          kind: 'order',
          prompt: 'Order one full Elliott cycle (start → end).',
          items: ['1', '2', '3', '4', '5', 'A', 'B', 'C'],
          explain: 'Five impulse waves, then the A-B-C correction.',
        },
        {
          kind: 'choice',
          prompt: 'Which wave is usually the strongest?',
          options: ['Wave 3', 'Wave 2', 'Wave A'],
          answer: 0,
          explain: 'Wave 3 is typically the longest, most powerful wave.',
        },
        {
          kind: 'blank',
          prompt: 'A correction unfolds in ___ waves labelled A-B-C.',
          options: ['three', 'five', 'eight'],
          answer: 0,
          explain: 'Corrections are 3-wave (A-B-C) structures.',
        },
      ],
    },
    {
      id: 'e-rules',
      title: 'The 3 rules',
      teach: [
        {
          emoji: '📏',
          heading: 'Three rules that never break',
          body: '1) Wave 2 never retraces more than 100% of Wave 1. 2) Wave 3 is never the shortest of 1/3/5. 3) Wave 4 never enters Wave 1’s price territory.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'Which is a hard Elliott rule?',
          options: [
            'Wave 3 is never the shortest',
            'Wave 3 is always the shortest',
            'Wave 2 always retraces 100%',
          ],
          answer: 0,
          explain: 'Wave 3 can’t be the shortest of waves 1, 3 and 5.',
        },
        {
          kind: 'blank',
          prompt: 'Wave 2 can never retrace more than ___% of wave 1.',
          options: ['100', '50', '38'],
          answer: 0,
          explain: 'If it retraces beyond 100%, the count is invalid.',
        },
        {
          kind: 'choice',
          prompt: 'Wave 4 must not overlap the price range of…',
          options: ['Wave 1', 'Wave 3', 'Wave C'],
          answer: 0,
          explain: 'Wave 4 cannot enter wave 1’s territory (in normal impulses).',
        },
      ],
    },
    {
      id: 'e-fib',
      title: 'Fibonacci in waves',
      teach: [
        {
          emoji: '🌀',
          heading: 'Waves breathe in Fibonacci',
          body: 'Corrective waves often retrace 38.2%, 50% or 61.8% of the prior wave. Impulse targets use Fibonacci extensions (e.g. 161.8%).',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'A common corrective retracement level is…',
          options: ['61.8%', '12%', '250%'],
          answer: 0,
          explain: '38.2 / 50 / 61.8% are the classic retracement levels.',
        },
        {
          kind: 'blank',
          prompt: 'Targets for impulse waves use Fibonacci ___.',
          options: ['extensions', 'candles', 'spreads'],
          answer: 0,
          explain: 'Extensions (like 161.8%) project impulse targets.',
        },
        {
          kind: 'match',
          prompt: 'Match the tool to its use.',
          pairs: [
            { a: 'Retracement', b: 'Where a pullback may end' },
            { a: 'Extension', b: 'Where a wave may target' },
          ],
          explain: 'Retracements find pullback ends; extensions find targets.',
        },
      ],
    },
  ],
};

export const TRACKS: Track[] = [BASICS, ICT, ELLIOTT];

export function getTrack(id: string): Track | undefined {
  return TRACKS.find((t) => t.id === id);
}
export function getLesson(id: string): { track: Track; lesson: Lesson } | undefined {
  for (const track of TRACKS) {
    const lesson = track.lessons.find((l) => l.id === id);
    if (lesson) return { track, lesson };
  }
  return undefined;
}
