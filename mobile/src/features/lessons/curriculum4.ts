import type { Track } from './types';
import { CHARTS } from './charts';

// ============================================================================
// CRYPTO ESSENTIALS  (free)
// ============================================================================
const CRYPTO: Track = {
  id: 'crypto',
  title: 'Crypto Essentials',
  subtitle: 'Blockchains, market cap, exchanges, wallets',
  icon: 'logo-bitcoin',
  color: '#F2B705',
  premium: false,
  lessons: [
    {
      id: 'ce-blockchain',
      title: 'What is crypto?',
      teach: [
        {
          emoji: '⛓️',
          heading: 'A shared, tamper-proof ledger',
          body: 'A blockchain is a public record of transactions copied across thousands of computers. No bank or middleman controls it — the network agrees on the truth. Crypto coins are the assets that live on these chains.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'A blockchain is best described as…',
          options: ['A shared, tamper-proof ledger', 'A single company database', 'A type of bank'],
          answer: 0,
          explain: 'It’s a decentralized record no single party controls.',
        },
        {
          kind: 'blank',
          prompt: 'Crypto removes the ___ from transactions.',
          options: ['middleman', 'internet', 'wallet'],
          answer: 0,
          explain: 'No bank in the middle — the network verifies it.',
        },
        {
          kind: 'choice',
          prompt: 'Who controls a public blockchain?',
          options: ['The whole network agrees', 'One CEO', 'A government'],
          answer: 0,
          explain: 'Consensus across many nodes, not one authority.',
        },
      ],
    },
    {
      id: 'ce-marketcap',
      title: 'Market cap & supply',
      teach: [
        {
          emoji: '🧮',
          heading: 'Price alone lies',
          body: 'Market cap = price × circulating supply. A coin at $0.01 isn’t "cheap" if it has trillions of coins. Market cap tells you the real size; always compare caps, not prices.',
        },
      ],
      exercises: [
        {
          kind: 'blank',
          prompt: 'Market cap = price × circulating ___.',
          options: ['supply', 'demand', 'volume'],
          answer: 0,
          explain: 'Supply matters as much as price.',
        },
        {
          kind: 'choice',
          prompt: 'A $0.01 coin is "cheap" only if…',
          options: ['Its market cap is small too', 'It just looks low', 'It’s under $1'],
          answer: 0,
          explain: 'Low price + huge supply can still be a giant cap.',
        },
        {
          kind: 'choice',
          prompt: 'To compare two coins’ size, look at…',
          options: ['Market cap', 'Price per coin', 'The logo'],
          answer: 0,
          explain: 'Cap reflects total value; price alone is meaningless.',
        },
      ],
    },
    {
      id: 'ce-exchanges',
      title: 'CEX vs DEX',
      teach: [
        {
          emoji: '🏦',
          heading: 'Two ways to trade',
          body: 'A centralized exchange (CEX) like Binance holds your funds and matches orders — easy, but you trust them. A decentralized exchange (DEX) like Uniswap swaps directly from your wallet via smart contracts — you stay in control.',
        },
      ],
      exercises: [
        {
          kind: 'match',
          prompt: 'Match the exchange to its trait.',
          pairs: [
            { a: 'CEX', b: 'Holds your funds' },
            { a: 'DEX', b: 'Trades from your wallet' },
          ],
          explain: 'CEX = custodial & easy; DEX = self-custodial.',
        },
        {
          kind: 'choice',
          prompt: 'On a DEX you trade…',
          options: ['Directly from your wallet', 'Through a bank', 'With cash'],
          answer: 0,
          explain: 'Smart contracts swap straight from your wallet.',
        },
        {
          kind: 'blank',
          prompt: 'A CEX requires you to ___ the platform with your funds.',
          options: ['trust', 'ignore', 'pay'],
          answer: 0,
          explain: 'Custodial = you trust them to hold your coins.',
        },
      ],
    },
    {
      id: 'ce-custody',
      title: 'Wallets & keys',
      teach: [
        {
          emoji: '🔑',
          heading: 'Not your keys, not your coins',
          body: 'A wallet holds your private keys — the secret that controls your crypto. If an exchange holds your keys, they control your coins. Self-custody (your own wallet) means only you can move them — and only you are responsible.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: '"Not your keys, not your coins" means…',
          options: ['If someone else holds the keys, they control your crypto', 'Keys are optional', 'Coins are free'],
          answer: 0,
          explain: 'Whoever holds the private keys controls the funds.',
        },
        {
          kind: 'blank',
          prompt: 'A wallet stores your private ___.',
          options: ['keys', 'coins', 'orders'],
          answer: 0,
          explain: 'Keys (not the coins themselves) live in the wallet.',
        },
        {
          kind: 'choice',
          prompt: 'Self-custody means…',
          options: ['Only you can move your funds', 'The exchange decides', 'No responsibility'],
          answer: 0,
          explain: 'Full control — and full responsibility.',
        },
      ],
    },
    {
      id: 'ce-stablecoins',
      title: 'Stablecoins',
      teach: [
        {
          emoji: '💵',
          heading: 'Crypto dollars',
          body: 'Stablecoins like USDT and USDC are pegged to $1, so they don’t swing like Bitcoin. Traders park profits in them to "go to cash" without leaving crypto, and most pairs are priced in them.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'A stablecoin is designed to…',
          options: ['Hold a steady value (≈ $1)', 'Moon 100x', 'Replace Bitcoin'],
          answer: 0,
          explain: 'Pegged to a dollar, it stays roughly stable.',
        },
        {
          kind: 'blank',
          prompt: 'Traders move into stablecoins to "go to ___" without leaving crypto.',
          options: ['cash', 'leverage', 'spot'],
          answer: 0,
          explain: 'Stablecoins act as crypto cash.',
        },
        {
          kind: 'choice',
          prompt: 'USDT and USDC are…',
          options: ['Stablecoins', 'Meme coins', 'Exchanges'],
          answer: 0,
          explain: 'Both are dollar-pegged stablecoins.',
        },
      ],
    },
    {
      id: 'ce-whatmoves',
      title: 'What moves crypto',
      teach: [
        {
          emoji: '🚀',
          heading: 'Supply, narratives & money',
          body: 'Big drivers: the Bitcoin halving (new supply cut ~every 4 years), narratives/hype (AI, memes, ETFs), and macro liquidity (when money is cheap, risk assets pump). Crypto trades 24/7, so it never sleeps.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'The Bitcoin halving roughly every 4 years…',
          options: ['Cuts new supply', 'Doubles supply', 'Ends Bitcoin'],
          answer: 0,
          explain: 'Block rewards halve, slowing new issuance.',
        },
        {
          kind: 'blank',
          prompt: 'Crypto markets trade ___ , unlike stocks.',
          options: ['24/7', '9–5', 'weekdays only'],
          answer: 0,
          explain: 'No closing bell — crypto never sleeps.',
        },
        {
          kind: 'choice',
          prompt: 'Risk assets like crypto tend to pump when…',
          options: ['Money is cheap (loose macro)', 'Rates spike', 'Liquidity dries up'],
          answer: 0,
          explain: 'Cheap money flows into risk-on assets.',
        },
      ],
    },
  ],
};

// ============================================================================
// MARKET CYCLES & SENTIMENT  (free)
// ============================================================================
const CYCLES: Track = {
  id: 'cycles',
  title: 'Cycles & Sentiment',
  subtitle: 'Bull, bear, and the crowd’s emotions',
  icon: 'sync',
  color: '#41C7E8',
  premium: false,
  lessons: [
    {
      id: 'mc-phases',
      title: 'The 4 phases',
      teach: [
        {
          heading: 'Every market breathes',
          body: 'Markets cycle through four phases: accumulation (smart money buys quietly), markup (the uptrend), distribution (smart money sells the hype), and markdown (the downtrend). Spotting the phase tells you whether to be aggressive or cautious.',
          chart: CHARTS.marketCycle,
        },
      ],
      exercises: [
        {
          kind: 'order',
          prompt: 'Order the market cycle (first → last).',
          items: ['Accumulation', 'Markup', 'Distribution', 'Markdown'],
          explain: 'Buy quietly, trend up, sell the hype, trend down.',
        },
        {
          kind: 'choice',
          prompt: 'Smart money quietly buys during…',
          options: ['Accumulation', 'Markup', 'Markdown'],
          answer: 0,
          explain: 'They build positions before the crowd notices.',
        },
        {
          kind: 'blank',
          prompt: 'The uptrend phase is called ___.',
          options: ['markup', 'markdown', 'distribution'],
          answer: 0,
          explain: 'Markup = the rising trend.',
        },
      ],
    },
    {
      id: 'mc-bullbear',
      title: 'Bull vs bear',
      teach: [
        {
          emoji: '🐂',
          heading: 'Two regimes',
          body: 'A bull market trends up — buying dips works. A bear market trends down — rallies get sold. Your strategy must match the regime: fighting the trend is the fastest way to lose.',
        },
      ],
      exercises: [
        {
          kind: 'match',
          prompt: 'Match the market to its move.',
          pairs: [
            { a: 'Bull market', b: 'Trends up' },
            { a: 'Bear market', b: 'Trends down' },
          ],
          explain: 'Bull = up, bear = down.',
        },
        {
          kind: 'choice',
          prompt: 'In a bull market, the edge is usually to…',
          options: ['Buy the dips', 'Short every rally', 'Do nothing'],
          answer: 0,
          explain: 'Trade with the up-trend, not against it.',
        },
        {
          kind: 'blank',
          prompt: 'Fighting the ___ is the fastest way to lose.',
          options: ['trend', 'spread', 'broker'],
          answer: 0,
          explain: 'The trend is your friend until it bends.',
        },
      ],
    },
    {
      id: 'mc-feargreed',
      title: 'Fear & Greed',
      teach: [
        {
          emoji: '😨',
          heading: 'Be greedy when others fear',
          body: 'The Fear & Greed Index runs 0–100. Extreme fear (low) often marks bottoms — everyone has already sold. Extreme greed (high) often marks tops. Crowds are usually most wrong at the extremes.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'Extreme FEAR on the index often marks…',
          options: ['A potential bottom', 'A guaranteed crash', 'A top'],
          answer: 0,
          explain: 'When everyone’s sold, downside is limited.',
        },
        {
          kind: 'blank',
          prompt: 'Be greedy when others are ___.',
          options: ['fearful', 'greedy', 'calm'],
          answer: 0,
          explain: 'The classic contrarian rule.',
        },
        {
          kind: 'choice',
          prompt: 'The crowd is usually most wrong at…',
          options: ['The extremes', 'The middle', 'Never'],
          answer: 0,
          explain: 'Peak greed and peak fear are turning points.',
        },
      ],
    },
    {
      id: 'mc-emotions',
      title: 'The emotion cycle',
      teach: [
        {
          emoji: '🎢',
          heading: 'Hope to euphoria to despair',
          body: 'Prices and emotions move together: optimism → euphoria (the top) → anxiety → panic → despair (the bottom). Knowing where the crowd’s feelings sit helps you act against the herd, not with it.',
        },
      ],
      exercises: [
        {
          kind: 'order',
          prompt: 'Order the emotional cycle (top → bottom).',
          items: ['Euphoria (top)', 'Anxiety', 'Panic', 'Despair (bottom)'],
          explain: 'Peak emotion = peak price, then the unwind.',
        },
        {
          kind: 'choice',
          prompt: 'Maximum euphoria usually coincides with…',
          options: ['The top', 'The bottom', 'The middle'],
          answer: 0,
          explain: 'When everyone’s euphoric, there are no buyers left.',
        },
        {
          kind: 'blank',
          prompt: 'The bottom is often the point of maximum ___.',
          options: ['despair', 'greed', 'hope'],
          answer: 0,
          explain: 'Capitulation/despair tends to mark lows.',
        },
      ],
    },
    {
      id: 'mc-dca',
      title: 'Surviving cycles',
      teach: [
        {
          emoji: '🧱',
          heading: 'DCA & patience',
          body: 'Dollar-cost averaging (DCA) means buying fixed amounts on a schedule, smoothing out the highs and lows so you don’t have to time the market. Combined with patience through bear markets, it’s how most people actually win long-term.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'Dollar-cost averaging means…',
          options: ['Buying fixed amounts on a schedule', 'Going all-in at the top', 'Only buying once'],
          answer: 0,
          explain: 'Regular buys smooth your average price.',
        },
        {
          kind: 'blank',
          prompt: 'DCA helps because you don’t have to ___ the market.',
          options: ['time', 'trust', 'leave'],
          answer: 0,
          explain: 'It removes the pressure of perfect timing.',
        },
        {
          kind: 'choice',
          prompt: 'Long-term winners usually rely on…',
          options: ['Patience + a plan', 'Leverage + luck', 'FOMO'],
          answer: 0,
          explain: 'Consistency beats chasing every cycle.',
        },
      ],
    },
  ],
};

export const FREE_EXTRA4: Track[] = [CRYPTO, CYCLES];
