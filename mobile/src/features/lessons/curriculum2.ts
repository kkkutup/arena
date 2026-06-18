import type { Track, SimpleCandle } from './types';
import { CHARTS } from './charts';

const c = (o: number, h: number, l: number, cl: number): SimpleCandle => ({ o, h, l, c: cl });

// ============================================================================
// CANDLESTICK PATTERNS  (free)
// ============================================================================
const CANDLES: Track = {
  id: 'candles',
  title: 'Candlestick Patterns',
  subtitle: 'Read the market’s mood, one candle at a time',
  icon: 'analytics',
  color: '#E0A91F',
  premium: false,
  lessons: [
    {
      id: 'cp-doji',
      title: 'The Doji',
      teach: [
        {
          heading: 'A standoff',
          chart: CHARTS.doji,
          body: 'A doji has almost no body — open and close are nearly equal. Buyers and sellers fought to a draw: indecision. Often a hint that a trend is tiring.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'A doji mainly signals…',
          options: ['Indecision', 'A guaranteed reversal', 'Strong momentum'],
          answer: 0,
          explain: 'Equal open/close = a balance of power, i.e. indecision.',
        },
        {
          kind: 'chart',
          prompt: 'Tap the doji.',
          chart: {
            candles: [c(100, 104, 99, 103), c(103, 106, 102, 105), c(105, 107, 103, 105.2), c(105, 109, 104, 108)],
            markers: [
              { index: 1, label: 'A' },
              { index: 2, label: 'B' },
              { index: 3, label: 'C' },
            ],
          },
          options: ['A', 'B', 'C'],
          answer: 1,
          explain: 'B opens 105 and closes ~105.2 — a tiny body = doji.',
        },
        {
          kind: 'blank',
          prompt: 'A doji is strongest as a signal when it appears after an extended ___.',
          options: ['trend', 'doji', 'gap'],
          answer: 0,
          explain: 'After a long trend, indecision often precedes a turn.',
        },
      ],
    },
    {
      id: 'cp-hammer',
      title: 'Hammer & hanging man',
      teach: [
        {
          heading: 'Long lower wick',
          chart: CHARTS.hammer,
          body: 'A hammer has a small body up top and a long lower wick — sellers pushed down but buyers slammed it back. At the bottom of a downtrend it’s bullish. The exact same shape at the top is a bearish "hanging man".',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'A hammer’s long lower wick shows…',
          options: ['Buyers rejected lower prices', 'Sellers took control', 'Nothing'],
          answer: 0,
          explain: 'Price dipped then got bought back up — rejection of lows.',
        },
        {
          kind: 'chart',
          prompt: 'Tap the hammer.',
          chart: {
            candles: [c(108, 109, 106, 107), c(107, 108, 105, 106), c(106, 107, 99, 106.5), c(106.5, 110, 106, 109)],
            markers: [
              { index: 1, label: 'A' },
              { index: 2, label: 'B' },
              { index: 3, label: 'C' },
            ],
          },
          options: ['A', 'B', 'C'],
          answer: 1,
          explain: 'B has a tiny body near the top and a long lower wick to 99 — a hammer.',
        },
        {
          kind: 'blank',
          prompt: 'The same hammer shape at the TOP of an uptrend is called a ___ man.',
          options: ['hanging', 'morning', 'three'],
          answer: 0,
          explain: 'Hammer at a top = bearish hanging man.',
        },
      ],
    },
    {
      id: 'cp-star',
      title: 'Shooting star',
      teach: [
        {
          heading: 'Long upper wick',
          chart: CHARTS.shootingStar,
          body: 'A shooting star is the hammer’s mirror: small body at the bottom, long upper wick. Buyers pushed up but sellers crushed it back. At the top of an uptrend it warns of a reversal down.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'A shooting star at the top of a rally suggests…',
          options: ['A possible reversal down', 'A continuation up', 'Higher volume only'],
          answer: 0,
          explain: 'Sellers rejected higher prices — bearish reversal hint.',
        },
        {
          kind: 'chart',
          prompt: 'Tap the shooting star.',
          chart: {
            candles: [c(100, 102, 99, 101), c(101, 103, 100, 102), c(102, 109, 101, 102.5), c(102.5, 103, 98, 99)],
            markers: [
              { index: 1, label: 'A' },
              { index: 2, label: 'B' },
              { index: 3, label: 'C' },
            ],
          },
          options: ['A', 'B', 'C'],
          answer: 1,
          explain: 'B spikes to 109 then closes ~102.5 — a long upper wick = shooting star.',
        },
        {
          kind: 'match',
          prompt: 'Match the candle to its wick.',
          pairs: [
            { a: 'Hammer', b: 'Long lower wick' },
            { a: 'Shooting star', b: 'Long upper wick' },
          ],
          explain: 'Hammer = lower wick (bullish), shooting star = upper wick (bearish).',
        },
      ],
    },
    {
      id: 'cp-engulfing',
      title: 'Engulfing patterns',
      teach: [
        {
          heading: 'One candle swallows the last',
          chart: CHARTS.engulfing,
          body: 'A bullish engulfing is a big green candle that fully covers the prior red body — buyers took over. A bearish engulfing is the opposite. Two candles, a clear power shift.',
        },
      ],
      exercises: [
        {
          kind: 'blank',
          prompt: 'A bullish engulfing’s green body fully ___ the previous red body.',
          options: ['covers', 'ignores', 'shrinks'],
          answer: 0,
          explain: 'It engulfs (covers) the prior candle — a shift to buyers.',
        },
        {
          kind: 'chart',
          prompt: 'Tap the bullish engulfing candle.',
          chart: {
            candles: [c(104, 105, 102, 103), c(103, 104, 101, 102), c(101.5, 108, 101, 107), c(107, 109, 106, 108)],
            markers: [
              { index: 1, label: 'A' },
              { index: 2, label: 'B' },
              { index: 3, label: 'C' },
            ],
          },
          options: ['A', 'B', 'C'],
          answer: 1,
          explain: 'B (index 2) opens below and closes above candle A’s whole body — engulfing.',
        },
        {
          kind: 'choice',
          prompt: 'A bearish engulfing signals…',
          options: ['Sellers taking control', 'Buyers taking control', 'Indecision'],
          answer: 0,
          explain: 'A big red candle engulfing a green one = sellers in charge.',
        },
      ],
    },
    {
      id: 'cp-stars3',
      title: 'Stars & soldiers',
      teach: [
        {
          heading: 'Morning & evening star',
          chart: CHARTS.morningStar,
          body: 'A morning star is a 3-candle bullish reversal: big red, small indecision candle, then big green. The evening star is its bearish mirror at a top.',
        },
        {
          emoji: '🪖',
          heading: 'Soldiers & crows',
          body: 'Three white soldiers = three strong green candles in a row (bullish). Three black crows = three strong reds (bearish).',
        },
      ],
      exercises: [
        {
          kind: 'order',
          prompt: 'Order the 3 candles of a morning star (first → last).',
          items: ['Big red candle', 'Small indecision candle', 'Big green candle'],
          explain: 'Down, pause, up — a bullish bottom reversal.',
        },
        {
          kind: 'choice',
          prompt: 'Three black crows is a…',
          options: ['Bearish signal', 'Bullish signal', 'Neutral signal'],
          answer: 0,
          explain: 'Three strong red candles = sellers dominating.',
        },
        {
          kind: 'match',
          prompt: 'Match the pattern to its bias.',
          pairs: [
            { a: 'Morning star', b: 'Bullish reversal' },
            { a: 'Evening star', b: 'Bearish reversal' },
          ],
          explain: 'Morning = bottom (bullish), evening = top (bearish).',
        },
      ],
    },
  ],
};

// ============================================================================
// CHART PATTERNS  (free)
// ============================================================================
const PATTERNS: Track = {
  id: 'patterns',
  title: 'Chart Patterns',
  subtitle: 'Tops, bottoms, triangles, flags',
  icon: 'trending-up',
  color: '#41C7E8',
  premium: false,
  lessons: [
    {
      id: 'pt-hs',
      title: 'Head & shoulders',
      teach: [
        {
          heading: 'Three peaks, middle highest',
          chart: CHARTS.headShoulders,
          body: 'Head & shoulders is a top reversal: a peak (shoulder), a higher peak (head), a lower peak (shoulder). Breaking the "neckline" connecting the lows confirms a move down. Flip it upside-down for the bullish inverse H&S.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'In a head & shoulders, the middle peak is…',
          options: ['The highest', 'The lowest', 'The same as the others'],
          answer: 0,
          explain: 'The head is the tallest peak between two shoulders.',
        },
        {
          kind: 'blank',
          prompt: 'The pattern confirms when price breaks the ___.',
          options: ['neckline', 'doji', 'wick'],
          answer: 0,
          explain: 'A neckline break confirms the reversal.',
        },
        {
          kind: 'choice',
          prompt: 'An inverse head & shoulders is…',
          options: ['A bullish bottom reversal', 'A bearish top reversal', 'A continuation'],
          answer: 0,
          explain: 'Upside-down H&S signals a bottom and a move up.',
        },
      ],
    },
    {
      id: 'pt-double',
      title: 'Double top & bottom',
      teach: [
        {
          heading: 'M and W shapes',
          chart: CHARTS.doubleTop,
          body: 'A double top (an "M") forms two peaks at a similar level — buyers fail twice, bearish. A double bottom (a "W") forms two equal lows — sellers fail twice, bullish.',
        },
      ],
      exercises: [
        {
          kind: 'match',
          prompt: 'Match the shape to its meaning.',
          pairs: [
            { a: 'Double top (M)', b: 'Bearish reversal' },
            { a: 'Double bottom (W)', b: 'Bullish reversal' },
          ],
          explain: 'M = two failed highs (bearish); W = two failed lows (bullish).',
        },
        {
          kind: 'choice',
          prompt: 'A double bottom shows that…',
          options: ['Sellers failed twice at a level', 'Buyers failed twice', 'Volume vanished'],
          answer: 0,
          explain: 'Two equal lows that hold = sellers exhausted = bullish.',
        },
        {
          kind: 'blank',
          prompt: 'A double top looks like the letter ___.',
          options: ['M', 'W', 'V'],
          answer: 0,
          explain: 'Two peaks form an "M".',
        },
      ],
    },
    {
      id: 'pt-triangles',
      title: 'Triangles',
      teach: [
        {
          emoji: '📐',
          heading: 'Squeezing into a decision',
          body: 'Ascending triangle: flat top + rising lows → usually breaks UP. Descending triangle: flat bottom + falling highs → usually breaks DOWN. Symmetrical: both converge → breaks in the trend’s direction.',
        },
      ],
      exercises: [
        {
          kind: 'match',
          prompt: 'Match the triangle to its usual break.',
          pairs: [
            { a: 'Ascending', b: 'Breaks up' },
            { a: 'Descending', b: 'Breaks down' },
          ],
          explain: 'Ascending = bullish bias, descending = bearish bias.',
        },
        {
          kind: 'choice',
          prompt: 'A symmetrical triangle usually breaks…',
          options: ['In the prior trend’s direction', 'Always up', 'Always down'],
          answer: 0,
          explain: 'It’s typically a continuation of the existing trend.',
        },
        {
          kind: 'blank',
          prompt: 'An ascending triangle has a flat top and ___ lows.',
          options: ['rising', 'falling', 'flat'],
          answer: 0,
          explain: 'Higher lows pressing into a flat ceiling → bullish break.',
        },
      ],
    },
    {
      id: 'pt-flags',
      title: 'Flags & pennants',
      teach: [
        {
          heading: 'A pause, then continue',
          chart: CHARTS.bullFlag,
          body: 'A flag is a sharp move (the "pole") followed by a small counter-trend channel, then a breakout the same way. Pennants are the same idea but the consolidation is a tiny triangle. Both are continuation patterns.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'A bull flag is a…',
          options: ['Continuation pattern', 'Reversal pattern', 'Random noise'],
          answer: 0,
          explain: 'After a strong pole, price pauses then continues up.',
        },
        {
          kind: 'order',
          prompt: 'Order a bull flag (first → last).',
          items: ['Sharp move up (pole)', 'Small pullback (flag)', 'Breakout up'],
          explain: 'Pole → flag → breakout in the same direction.',
        },
        {
          kind: 'blank',
          prompt: 'A pennant’s consolidation is shaped like a small ___.',
          options: ['triangle', 'square', 'circle'],
          answer: 0,
          explain: 'A pennant consolidates into a little triangle.',
        },
      ],
    },
    {
      id: 'pt-wedge-cup',
      title: 'Wedges & cup-and-handle',
      teach: [
        {
          emoji: '📉',
          heading: 'Wedges',
          body: 'A rising wedge (both lines slope up, converging) is usually bearish. A falling wedge is usually bullish.',
        },
        {
          emoji: '☕',
          heading: 'Cup & handle',
          body: 'A rounded "cup" bottom followed by a small dip "handle", then a breakout up — a reliable bullish continuation.',
        },
      ],
      exercises: [
        {
          kind: 'match',
          prompt: 'Match the wedge to its bias.',
          pairs: [
            { a: 'Rising wedge', b: 'Bearish' },
            { a: 'Falling wedge', b: 'Bullish' },
          ],
          explain: 'Counter-intuitive: rising wedge = bearish, falling = bullish.',
        },
        {
          kind: 'choice',
          prompt: 'A cup-and-handle is generally…',
          options: ['A bullish continuation', 'A bearish reversal', 'Meaningless'],
          answer: 0,
          explain: 'After the cup + handle, price tends to break upward.',
        },
        {
          kind: 'blank',
          prompt: 'The small dip after the cup is called the ___.',
          options: ['handle', 'neckline', 'pole'],
          answer: 0,
          explain: 'Cup, then handle, then breakout.',
        },
      ],
    },
  ],
};

// ============================================================================
// INDICATORS  (free)
// ============================================================================
const INDICATORS: Track = {
  id: 'indicators',
  title: 'Indicators',
  subtitle: 'Moving averages, RSI, MACD, Bollinger',
  icon: 'speedometer',
  color: '#11A06B',
  premium: false,
  lessons: [
    {
      id: 'in-ma',
      title: 'Moving averages',
      teach: [
        {
          emoji: '〽️',
          heading: 'Smoothing the noise',
          body: 'A moving average plots the average price over N candles, smoothing the chart to reveal the trend. SMA weights all candles equally; EMA reacts faster by weighting recent ones.',
        },
        {
          emoji: '✨',
          heading: 'Golden & death cross',
          body: 'When a faster MA (e.g. 50) crosses ABOVE a slower one (200) it’s a bullish "golden cross". Crossing below is a bearish "death cross".',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'Which reacts faster to recent price?',
          options: ['EMA', 'SMA', 'They’re identical'],
          answer: 0,
          explain: 'The EMA weights recent candles more, so it turns quicker.',
        },
        {
          kind: 'blank',
          prompt: 'The 50 crossing above the 200 is a ___ cross.',
          options: ['golden', 'death', 'doji'],
          answer: 0,
          explain: 'Fast over slow = bullish golden cross.',
        },
        {
          kind: 'choice',
          prompt: 'A moving average mainly helps you…',
          options: ['See the trend more clearly', 'Predict exact tops', 'Remove all risk'],
          answer: 0,
          explain: 'MAs smooth noise to clarify trend direction.',
        },
      ],
    },
    {
      id: 'in-rsi',
      title: 'RSI',
      teach: [
        {
          emoji: '🌡️',
          heading: 'Momentum, 0–100',
          body: 'The Relative Strength Index measures momentum from 0 to 100. Above 70 = overbought (stretched up). Below 30 = oversold (stretched down). It’s a thermometer, not a timer.',
        },
      ],
      exercises: [
        {
          kind: 'blank',
          prompt: 'RSI above ___ is considered overbought.',
          options: ['70', '30', '100'],
          answer: 0,
          explain: '>70 overbought, <30 oversold.',
        },
        {
          kind: 'choice',
          prompt: 'RSI below 30 means price is…',
          options: ['Oversold', 'Overbought', 'Trending up strongly'],
          answer: 0,
          explain: 'Under 30 = oversold, possibly due a bounce.',
        },
        {
          kind: 'choice',
          prompt: 'RSI measures…',
          options: ['Momentum (speed of moves)', 'Trading volume', 'The spread'],
          answer: 0,
          explain: 'It’s a momentum oscillator.',
        },
      ],
    },
    {
      id: 'in-macd',
      title: 'MACD',
      teach: [
        {
          emoji: '〰️',
          heading: 'Two lines + a histogram',
          body: 'MACD = 12-EMA minus 26-EMA. A 9-EMA "signal line" rides on top. When MACD crosses above the signal, momentum turns up; below, down. The histogram shows the gap between them.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'MACD crossing ABOVE its signal line suggests…',
          options: ['Upward momentum', 'Downward momentum', 'Nothing'],
          answer: 0,
          explain: 'A bullish crossover hints momentum is turning up.',
        },
        {
          kind: 'blank',
          prompt: 'The MACD signal line is a ___-period EMA of the MACD.',
          options: ['9', '70', '200'],
          answer: 0,
          explain: 'The 9-EMA of the MACD line is the signal.',
        },
        {
          kind: 'choice',
          prompt: 'The MACD histogram shows…',
          options: ['The gap between MACD and signal', 'Volume', 'Price itself'],
          answer: 0,
          explain: 'Histogram = distance between the two lines.',
        },
      ],
    },
    {
      id: 'in-bb',
      title: 'Bollinger Bands',
      teach: [
        {
          emoji: '🎚️',
          heading: 'Volatility envelope',
          body: 'Bollinger Bands wrap a 20-period average with bands two standard deviations away. Price near the upper band = stretched high; near the lower = stretched low. A "squeeze" (tight bands) warns a big move is coming.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'A Bollinger "squeeze" (tight bands) signals…',
          options: ['Low volatility, big move coming', 'A guaranteed crash', 'High volume now'],
          answer: 0,
          explain: 'Tight bands = calm before an expansion.',
        },
        {
          kind: 'blank',
          prompt: 'The middle Bollinger band is a ___-period average.',
          options: ['20', '9', '200'],
          answer: 0,
          explain: 'Middle band = 20-period SMA, ±2 std dev.',
        },
        {
          kind: 'choice',
          prompt: 'Price hugging the upper band means it’s…',
          options: ['Stretched to the high side', 'Definitely reversing', 'Low volatility'],
          answer: 0,
          explain: 'Near the upper band = relatively high/stretched.',
        },
      ],
    },
    {
      id: 'in-divergence',
      title: 'Volume & divergence',
      teach: [
        {
          emoji: '🔊',
          heading: 'Volume confirms',
          body: 'Volume is the fuel. A breakout on high volume is trustworthy; on low volume it’s suspect.',
        },
        {
          emoji: '🔀',
          heading: 'Divergence',
          body: 'When price makes a higher high but RSI makes a lower high, that’s bearish divergence — momentum is fading even as price rises. A classic reversal warning.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'A breakout you can trust usually has…',
          options: ['High volume', 'Low volume', 'No volume'],
          answer: 0,
          explain: 'Volume confirms conviction behind a move.',
        },
        {
          kind: 'blank',
          prompt: 'Price up but RSI down is called bearish ___.',
          options: ['divergence', 'convergence', 'momentum'],
          answer: 0,
          explain: 'Divergence between price and momentum warns of a turn.',
        },
        {
          kind: 'choice',
          prompt: 'Divergence is best used as…',
          options: ['A warning, with confirmation', 'A standalone guarantee', 'A volume tool'],
          answer: 0,
          explain: 'Treat divergence as a heads-up, not a certainty.',
        },
      ],
    },
  ],
};

// ============================================================================
// RISK & MINDSET  (free)
// ============================================================================
const MINDSET: Track = {
  id: 'mindset',
  title: 'Risk & Mindset',
  subtitle: 'Sizing, discipline, and beating your own brain',
  icon: 'shield-checkmark',
  color: '#E23F50',
  premium: false,
  lessons: [
    {
      id: 'm-sizing',
      title: 'Position sizing',
      teach: [
        {
          heading: 'Size from your stop',
          chart: CHARTS.slTp,
          body: 'Decide your risk first (say 1% of the account), then size the trade so that hitting your stop-loss only loses that 1%. Big stop → smaller position. The market sets the size, not your excitement.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'You set position size based on…',
          options: ['Your stop distance + risk %', 'Your gut feeling', 'The biggest size allowed'],
          answer: 0,
          explain: 'Risk % and stop distance determine size.',
        },
        {
          kind: 'blank',
          prompt: 'A wider stop means a ___ position size (same risk).',
          options: ['smaller', 'bigger', 'fixed'],
          answer: 0,
          explain: 'To risk the same %, a wider stop forces a smaller size.',
        },
        {
          kind: 'choice',
          prompt: 'The first thing to decide on any trade is…',
          options: ['How much you’ll risk', 'How much you’ll make', 'The leverage'],
          answer: 0,
          explain: 'Risk first — everything else follows.',
        },
      ],
    },
    {
      id: 'm-winrate',
      title: 'Win rate vs R:R',
      teach: [
        {
          heading: 'You can lose more than you win',
          chart: CHARTS.riskReward,
          body: 'With a 1:3 reward-to-risk, you only need to win ~1 in 4 trades to break even. Great traders are often "wrong" half the time — their winners are just bigger than their losers.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'With strong R:R, being wrong often is…',
          options: ['Survivable and can still profit', 'Always fatal', 'Impossible'],
          answer: 0,
          explain: 'Bigger winners outweigh frequent small losses.',
        },
        {
          kind: 'blank',
          prompt: 'High win-rate matters less than your risk-to-___.',
          options: ['reward', 'margin', 'volume'],
          answer: 0,
          explain: 'R:R can make a low win-rate profitable.',
        },
        {
          kind: 'choice',
          prompt: 'A 1:3 R:R needs roughly what win-rate to break even?',
          options: ['About 25%', 'About 75%', 'About 100%'],
          answer: 0,
          explain: 'Win 1, lose 3 at 1:3 = breakeven, so ~25%.',
        },
      ],
    },
    {
      id: 'm-fomo',
      title: 'FOMO',
      teach: [
        {
          heading: 'Fear of missing out',
          chart: CHARTS.fomo,
          body: 'FOMO is chasing a move you already missed — buying the top because you can’t stand watching it run. It produces late entries with terrible risk-to-reward. There’s always another trade.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'FOMO usually leads to…',
          options: ['Late entries with poor R:R', 'Perfect entries', 'Lower risk'],
          answer: 0,
          explain: 'Chasing = buying high, bad risk-to-reward.',
        },
        {
          kind: 'blank',
          prompt: 'The cure for FOMO: there’s always another ___.',
          options: ['trade', 'candle', 'broker'],
          answer: 0,
          explain: 'Missing one setup is fine — opportunities repeat.',
        },
        {
          kind: 'choice',
          prompt: 'The healthy response to a missed move is…',
          options: ['Wait for your next valid setup', 'Chase it immediately', 'Double your size'],
          answer: 0,
          explain: 'Patience beats chasing.',
        },
      ],
    },
    {
      id: 'm-revenge',
      title: 'Revenge trading',
      teach: [
        {
          emoji: '😤',
          heading: 'Trying to "win it back"',
          body: 'After a loss, the urge to instantly make it back leads to oversized, unplanned trades — and usually bigger losses. Step away. The market doesn’t owe you anything.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'Revenge trading typically causes…',
          options: ['Bigger losses', 'Guaranteed recovery', 'Lower emotion'],
          answer: 0,
          explain: 'Emotional, oversized trades dig the hole deeper.',
        },
        {
          kind: 'blank',
          prompt: 'The best move after a painful loss is often to ___.',
          options: ['step away', 'double down', 'remove your stop'],
          answer: 0,
          explain: 'Cooling off prevents the revenge spiral.',
        },
        {
          kind: 'match',
          prompt: 'Match the emotion to its trap.',
          pairs: [
            { a: 'FOMO', b: 'Chasing entries' },
            { a: 'Revenge', b: 'Oversizing after a loss' },
          ],
          explain: 'FOMO chases; revenge oversizes.',
        },
      ],
    },
    {
      id: 'm-plan',
      title: 'Plan & journal',
      teach: [
        {
          emoji: '🗒️',
          heading: 'Rules beat moods',
          body: 'A trading plan defines what you trade, your entry, stop, target, and risk — before you click. A journal records every trade and your emotions, so you can spot and fix your leaks. Consistency comes from process, not prediction.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'A trading plan is decided…',
          options: ['Before you enter', 'Mid-trade', 'After you exit'],
          answer: 0,
          explain: 'Plan the trade before emotions take over.',
        },
        {
          kind: 'blank',
          prompt: 'A ___ records your trades and emotions to find leaks.',
          options: ['journal', 'broker', 'screener'],
          answer: 0,
          explain: 'Journaling reveals recurring mistakes.',
        },
        {
          kind: 'choice',
          prompt: 'Long-term consistency comes mostly from…',
          options: ['Discipline & process', 'Perfect predictions', 'High leverage'],
          answer: 0,
          explain: 'Execute the process regardless of how you feel.',
        },
      ],
    },
  ],
};

// ============================================================================
// WYCKOFF METHOD  (premium)
// ============================================================================
const WYCKOFF: Track = {
  id: 'wyckoff',
  title: 'Wyckoff Method',
  subtitle: 'How smart money accumulates & distributes',
  icon: 'business',
  color: '#CD7F32',
  premium: true,
  lessons: [
    {
      id: 'w-operator',
      title: 'The Composite Operator',
      teach: [
        {
          emoji: '🎭',
          heading: 'Think like the big player',
          body: 'Wyckoff imagines all large institutions as one "Composite Operator" who accumulates cheap, marks price up, then distributes to the crowd. Read the chart as that operator’s campaign.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'The Composite Operator is a way to…',
          options: ['Think like big institutions as one actor', 'Predict the news', 'Measure volume only'],
          answer: 0,
          explain: 'It models smart money as a single campaign-running player.',
        },
        {
          kind: 'order',
          prompt: 'Order the operator’s campaign (first → last).',
          items: ['Accumulate (buy low)', 'Mark up (price rises)', 'Distribute (sell high)'],
          explain: 'Buy quietly low, push up, then offload to the crowd.',
        },
        {
          kind: 'blank',
          prompt: 'Wyckoff treats all institutions as one ___ operator.',
          options: ['composite', 'random', 'retail'],
          answer: 0,
          explain: 'The Composite Operator is the core mental model.',
        },
      ],
    },
    {
      id: 'w-laws',
      title: 'The 3 laws',
      teach: [
        {
          emoji: '⚖️',
          heading: 'Supply/demand, cause/effect, effort/result',
          body: '1) Supply & Demand drive price. 2) Cause & Effect: the size of a range (cause) sets the move’s size (effect). 3) Effort vs Result: volume (effort) should match the price move (result) — a mismatch warns of a turn.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'Big volume but barely any price move signals…',
          options: ['Effort ≠ result (possible reversal)', 'A guaranteed breakout', 'Nothing'],
          answer: 0,
          explain: 'Effort vs result mismatch = absorption, a turn warning.',
        },
        {
          kind: 'match',
          prompt: 'Match the law to its idea.',
          pairs: [
            { a: 'Cause & effect', b: 'Range size → move size' },
            { a: 'Effort vs result', b: 'Volume should match the move' },
          ],
          explain: 'These two laws are Wyckoff’s analytical core.',
        },
        {
          kind: 'blank',
          prompt: 'The most basic law: ___ and demand move price.',
          options: ['supply', 'effort', 'cause'],
          answer: 0,
          explain: 'Supply & demand is the first law.',
        },
      ],
    },
    {
      id: 'w-accum',
      title: 'Accumulation & the Spring',
      teach: [
        {
          heading: 'Building a base',
          chart: CHARTS.spring,
          body: 'After a downtrend, price ranges sideways while the operator buys. The key signal is the Spring — a quick dip below support that snaps back, trapping sellers and grabbing liquidity before the markup.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'A Wyckoff Spring is…',
          options: ['A false breakdown below support', 'A breakout above resistance', 'A doji'],
          answer: 0,
          explain: 'Price dips below support then recovers — a bullish trap.',
        },
        {
          kind: 'chart',
          prompt: 'Tap the spring (false breakdown that snaps back).',
          chart: {
            candles: [c(100, 101, 99, 100), c(100, 101, 99, 99.5), c(99.5, 100, 95, 99), c(99, 104, 98, 103)],
            markers: [
              { index: 1, label: 'A' },
              { index: 2, label: 'B' },
              { index: 3, label: 'C' },
            ],
          },
          options: ['A', 'B', 'C'],
          answer: 1,
          explain: 'B pierces support to 95 then closes back at 99 — a spring.',
        },
        {
          kind: 'blank',
          prompt: 'A spring traps ___ before price rallies.',
          options: ['sellers', 'buyers', 'no one'],
          answer: 0,
          explain: 'Breakdown sellers get trapped as price snaps back up.',
        },
      ],
    },
    {
      id: 'w-dist',
      title: 'Distribution & UTAD',
      teach: [
        {
          heading: 'Unloading at the top',
          chart: CHARTS.utad,
          body: 'After an uptrend, price ranges while the operator sells to the crowd. The mirror of the spring is the Upthrust After Distribution (UTAD) — a false breakout above resistance that fails, trapping buyers before the markdown.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'A UTAD is…',
          options: ['A false breakout above resistance', 'A false breakdown', 'A volume spike only'],
          answer: 0,
          explain: 'Upthrust above resistance that fails = bearish trap.',
        },
        {
          kind: 'match',
          prompt: 'Match the trap to its phase.',
          pairs: [
            { a: 'Spring', b: 'Accumulation (bullish)' },
            { a: 'UTAD', b: 'Distribution (bearish)' },
          ],
          explain: 'Spring = bottom trap, UTAD = top trap.',
        },
        {
          kind: 'blank',
          prompt: 'An upthrust traps ___ before the markdown.',
          options: ['buyers', 'sellers', 'whales'],
          answer: 0,
          explain: 'Breakout buyers get trapped as price fails and drops.',
        },
      ],
    },
    {
      id: 'w-phases',
      title: 'The 5 phases (A–E)',
      teach: [
        {
          emoji: '🔤',
          heading: 'A range unfolds in five acts',
          body: 'A (stop the prior trend) → B (build the cause / the range) → C (the test: Spring or UTAD) → D (the move begins: SOS/SOW) → E (price leaves the range into the new trend).',
        },
      ],
      exercises: [
        {
          kind: 'order',
          prompt: 'Order the Wyckoff phases (first → last).',
          items: [
            'A — stop the trend',
            'B — build the cause',
            'C — the test (spring/UTAD)',
            'D — the move begins',
            'E — leave the range',
          ],
          explain: 'A→B→C→D→E: stop, build, test, move, leave.',
        },
        {
          kind: 'choice',
          prompt: 'The Spring or UTAD happens in phase…',
          options: ['C', 'A', 'E'],
          answer: 0,
          explain: 'Phase C is the test that traps the crowd.',
        },
        {
          kind: 'blank',
          prompt: 'Phase B is where the operator builds the ___.',
          options: ['cause', 'spring', 'trend'],
          answer: 0,
          explain: 'Cause & effect — phase B builds the cause for the move.',
        },
      ],
    },
    {
      id: 'w-events',
      title: 'Accumulation events',
      teach: [
        {
          emoji: '🧩',
          heading: 'The footprints to spot',
          body: 'Selling Climax (SC) — panic low on huge volume. Automatic Rally (AR) — the bounce. Secondary Test (ST) — retest of the low. Sign of Strength (SOS) — a strong rally out. Last Point of Support (LPS) — the higher low before markup.',
        },
      ],
      exercises: [
        {
          kind: 'match',
          prompt: 'Match the event to its meaning.',
          pairs: [
            { a: 'Selling climax', b: 'Panic low, huge volume' },
            { a: 'Sign of strength', b: 'Strong rally out of range' },
            { a: 'Last point of support', b: 'Higher low before markup' },
          ],
          explain: 'SC = capitulation, SOS = strength, LPS = the launch pad.',
        },
        {
          kind: 'choice',
          prompt: 'The Selling Climax is marked by…',
          options: ['Panic selling on high volume', 'Quiet drifting', 'A single doji'],
          answer: 0,
          explain: 'Capitulation: maximum fear, maximum volume.',
        },
        {
          kind: 'order',
          prompt: 'Order these accumulation events (first → last).',
          items: ['Selling climax', 'Spring', 'Sign of strength', 'Last point of support'],
          explain: 'Capitulate, test, show strength, then the launch low.',
        },
      ],
    },
    {
      id: 'w-dist-events',
      title: 'Distribution events',
      teach: [
        {
          heading: 'Topping signals',
          body: 'The mirror of accumulation: a Buying Climax (BC) — euphoric high on huge volume; an Automatic Reaction (AR); an Upthrust (UT) and the UTAD; a Sign of Weakness (SOW); and the Last Point of Supply (LPSY) — the lower high before markdown.',
          chart: CHARTS.utad,
        },
      ],
      exercises: [
        {
          kind: 'match',
          prompt: 'Match the distribution event to its meaning.',
          pairs: [
            { a: 'Buying climax', b: 'Euphoric high, huge volume' },
            { a: 'Sign of weakness', b: 'Strong drop out of range' },
            { a: 'Last point of supply', b: 'Lower high before markdown' },
          ],
          explain: 'BC = euphoria, SOW = weakness, LPSY = the launch-down.',
        },
        {
          kind: 'choice',
          prompt: 'The Buying Climax is marked by…',
          options: ['Euphoric buying on high volume', 'Quiet drifting', 'A spring'],
          answer: 0,
          explain: 'Maximum greed and volume — the opposite of a selling climax.',
        },
        {
          kind: 'order',
          prompt: 'Order these distribution events (first → last).',
          items: ['Buying climax', 'Upthrust (UTAD)', 'Sign of weakness', 'Last point of supply'],
          explain: 'Euphoria, the trap, weakness, then the lower high.',
        },
      ],
    },
  ],
};

// ============================================================================
// FIBONACCI & CONFLUENCE  (premium)
// ============================================================================
const FIB: Track = {
  id: 'fib',
  title: 'Fibonacci & Confluence',
  subtitle: 'Golden ratios and stacking the odds',
  icon: 'git-network',
  color: '#F2B705',
  premium: true,
  lessons: [
    {
      id: 'f-retrace',
      title: 'Retracement levels',
      teach: [
        {
          emoji: '🌀',
          heading: 'How far pullbacks go',
          body: 'Draw the Fib tool from a swing low to a swing high. Pullbacks often pause at 38.2%, 50%, 61.8% and 78.6%. These are where buyers tend to re-enter an uptrend.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'Which is a key Fibonacci retracement level?',
          options: ['61.8%', '12.5%', '200%'],
          answer: 0,
          explain: '23.6 / 38.2 / 50 / 61.8 / 78.6% are the classic levels.',
        },
        {
          kind: 'blank',
          prompt: 'You draw a retracement from a swing low to a swing ___.',
          options: ['high', 'low', 'close'],
          answer: 0,
          explain: 'Low → high for an uptrend pullback (and vice-versa).',
        },
        {
          kind: 'order',
          prompt: 'Order these retracement levels (shallow → deep).',
          items: ['23.6%', '38.2%', '61.8%', '78.6%'],
          explain: 'Deeper pullbacks reach the higher percentages.',
        },
      ],
    },
    {
      id: 'f-golden',
      title: 'The golden pocket',
      teach: [
        {
          heading: '0.618 — the golden ratio',
          chart: CHARTS.goldenPocket,
          body: 'The 61.8% level comes from the golden ratio found throughout nature. The zone between 61.8% and 65% is the "golden pocket" — a favorite high-probability entry area.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'The "golden pocket" sits around…',
          options: ['61.8–65%', '10–15%', '90–100%'],
          answer: 0,
          explain: 'The 0.618–0.65 zone is the golden pocket.',
        },
        {
          kind: 'blank',
          prompt: 'The golden ratio is approximately ___%.',
          options: ['61.8', '38.2', '50'],
          answer: 0,
          explain: '0.618 (61.8%) is the golden ratio.',
        },
        {
          kind: 'choice',
          prompt: 'This ICT idea overlaps the golden pocket:',
          options: ['Optimal Trade Entry (62–79%)', 'Kill zones', 'Order blocks'],
          answer: 0,
          explain: 'OTE’s deep retracement overlaps the golden pocket.',
        },
      ],
    },
    {
      id: 'f-extension',
      title: 'Extensions & targets',
      teach: [
        {
          emoji: '🎯',
          heading: 'Where moves may end',
          body: 'Fibonacci extensions (127.2%, 161.8%, 261.8%) project where a move might reach — handy take-profit targets, especially for Elliott wave 3 and 5.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'Extensions are used to find…',
          options: ['Profit targets', 'Stop placement only', 'Volume'],
          answer: 0,
          explain: 'Extensions project where a move may complete.',
        },
        {
          kind: 'blank',
          prompt: 'A very common extension target is ___%.',
          options: ['161.8', '50', '23.6'],
          answer: 0,
          explain: '1.618 (161.8%) is the classic extension target.',
        },
        {
          kind: 'match',
          prompt: 'Match the tool to its job.',
          pairs: [
            { a: 'Retracement', b: 'Find the entry pullback' },
            { a: 'Extension', b: 'Find the target' },
          ],
          explain: 'Retrace for entries, extend for targets.',
        },
      ],
    },
    {
      id: 'f-confluence',
      title: 'Confluence',
      teach: [
        {
          emoji: '🧲',
          heading: 'Stack your edges',
          body: 'Confluence is when several signals point to the same price: a Fib level + support + an order block + a trendline. The more that line up, the higher-probability the setup. One signal is a guess; four is a plan.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'Confluence means…',
          options: ['Multiple signals agree at one level', 'Using one indicator', 'Ignoring structure'],
          answer: 0,
          explain: 'Stacked, agreeing signals raise probability.',
        },
        {
          kind: 'blank',
          prompt: 'More confluence = ___ probability setup.',
          options: ['higher', 'lower', 'zero'],
          answer: 0,
          explain: 'Agreeing signals strengthen the case.',
        },
        {
          kind: 'choice',
          prompt: 'Best example of confluence?',
          options: [
            'Fib 61.8% + support + order block align',
            'A single moving average',
            'A random round number',
          ],
          answer: 0,
          explain: 'Several independent reasons at one price = confluence.',
        },
      ],
    },
  ],
};

// ============================================================================
// HARMONIC PATTERNS  (premium)
// ============================================================================
const HARMONIC: Track = {
  id: 'harmonic',
  title: 'Harmonic Patterns',
  subtitle: 'Fibonacci geometry: Gartley, Bat, Butterfly',
  icon: 'shapes',
  color: '#9B59B6',
  premium: true,
  lessons: [
    {
      id: 'h-intro',
      title: 'What are harmonics?',
      teach: [
        {
          emoji: '🦋',
          heading: 'Geometry meets Fibonacci',
          body: 'Harmonic patterns are precise, Fibonacci-based reversal shapes drawn through 5 points (XABCD). Each leg must hit specific ratios, so they’re stricter than ordinary patterns — and they pinpoint a Potential Reversal Zone (PRZ).',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'Harmonic patterns are built on…',
          options: ['Fibonacci ratios', 'Volume only', 'News events'],
          answer: 0,
          explain: 'Each leg must satisfy precise Fib ratios.',
        },
        {
          kind: 'blank',
          prompt: 'The reversal area a harmonic points to is the ___.',
          options: ['PRZ', 'RSI', 'MACD'],
          answer: 0,
          explain: 'PRZ = Potential Reversal Zone.',
        },
        {
          kind: 'choice',
          prompt: 'Compared to normal chart patterns, harmonics are…',
          options: ['Stricter (exact ratios)', 'Looser', 'Random'],
          answer: 0,
          explain: 'Exact ratios make them precise but pickier.',
        },
      ],
    },
    {
      id: 'h-abcd',
      title: 'The ABCD',
      teach: [
        {
          heading: 'The simplest harmonic',
          chart: CHARTS.abcd,
          body: 'In an ABCD, the AB and CD legs are roughly equal. BC retraces 61.8–78.6% of AB, and CD is often a 127–161.8% extension of BC. Point D is the reversal.',
        },
      ],
      exercises: [
        {
          kind: 'order',
          prompt: 'Order the points of an ABCD (first → last).',
          items: ['A', 'B', 'C', 'D'],
          explain: 'AB leg, BC retrace, CD reversal leg ending at D.',
        },
        {
          kind: 'choice',
          prompt: 'In an ABCD, the AB and CD legs are usually…',
          options: ['Roughly equal', 'Wildly different', 'Always vertical'],
          answer: 0,
          explain: 'Symmetry: AB ≈ CD is the core of the pattern.',
        },
        {
          kind: 'blank',
          prompt: 'The reversal occurs at point ___.',
          options: ['D', 'A', 'B'],
          answer: 0,
          explain: 'D completes the pattern and marks the turn.',
        },
      ],
    },
    {
      id: 'h-gartley',
      title: 'The Gartley',
      teach: [
        {
          heading: 'The classic XABCD',
          chart: CHARTS.xabcd,
          body: 'In a Gartley, B retraces ~61.8% of the XA leg, and D completes near 78.6% of XA — a high-probability reversal with a tight stop just beyond X.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'In a Gartley, B retraces about ___ of XA.',
          options: ['61.8%', '100%', '23.6%'],
          answer: 0,
          explain: 'The 0.618 B point defines the Gartley.',
        },
        {
          kind: 'blank',
          prompt: 'The Gartley’s D point completes near ___% of XA.',
          options: ['78.6', '161.8', '38.2'],
          answer: 0,
          explain: 'D ≈ 0.786 of XA is the Gartley’s reversal.',
        },
        {
          kind: 'choice',
          prompt: 'A Gartley is a…',
          options: ['Reversal pattern', 'Continuation pattern', 'Volume indicator'],
          answer: 0,
          explain: 'It points to a turn at the PRZ.',
        },
      ],
    },
    {
      id: 'h-bat-butterfly',
      title: 'Bat & Butterfly',
      teach: [
        {
          heading: 'Deep vs extended',
          chart: CHARTS.xabcd,
          body: 'The Bat completes D at ~88.6% of XA — deep, but still inside the move. The Butterfly extends D BEYOND X (~127% of XA), catching a reversal at a brand-new extreme.',
        },
      ],
      exercises: [
        {
          kind: 'match',
          prompt: 'Match the pattern to its D point.',
          pairs: [
            { a: 'Bat', b: 'D at ~88.6% of XA' },
            { a: 'Butterfly', b: 'D beyond X (~127%)' },
          ],
          explain: 'Bat is deep-inside; Butterfly overshoots X.',
        },
        {
          kind: 'choice',
          prompt: 'The Butterfly’s D point is…',
          options: ['Beyond X (a new extreme)', 'Exactly at X', 'At point B'],
          answer: 0,
          explain: 'The Butterfly extends past X to ~1.27 of XA.',
        },
        {
          kind: 'blank',
          prompt: 'A Bat completes near ___% of XA.',
          options: ['88.6', '61.8', '50'],
          answer: 0,
          explain: 'The 0.886 D point is the Bat’s signature.',
        },
      ],
    },
  ],
};

export const FREE_EXTRA: Track[] = [CANDLES, PATTERNS, INDICATORS, MINDSET];
export const PREMIUM_EXTRA: Track[] = [WYCKOFF, FIB, HARMONIC];
