import type { Track } from './types';
import { CHARTS } from './charts';

// ============================================================================
// DeFi & ON-CHAIN  (free)
// ============================================================================
const DEFI: Track = {
  id: 'defi',
  title: 'DeFi & On-chain',
  subtitle: 'Gas, pools, staking, and staying safe',
  icon: 'cube',
  color: '#11A06B',
  premium: false,
  lessons: [
    {
      id: 'df-defi',
      title: 'What is DeFi?',
      teach: [
        {
          emoji: '🏗️',
          heading: 'Finance without banks',
          body: 'DeFi (Decentralized Finance) replaces banks and brokers with smart contracts — self-running code on a blockchain. You lend, borrow, swap and earn directly from your wallet, no middleman, no permission needed.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'DeFi replaces banks with…',
          options: ['Smart contracts', 'Other banks', 'Governments'],
          answer: 0,
          explain: 'Self-executing code runs the service, not a company.',
        },
        {
          kind: 'blank',
          prompt: 'In DeFi you act directly from your ___.',
          options: ['wallet', 'bank', 'broker'],
          answer: 0,
          explain: 'Your wallet is your account — no intermediary.',
        },
        {
          kind: 'choice',
          prompt: 'A key DeFi trait is that it’s…',
          options: ['Permissionless', 'Invite-only', 'Bank-approved'],
          answer: 0,
          explain: 'Anyone with a wallet can use it.',
        },
      ],
    },
    {
      id: 'df-gas',
      title: 'Gas fees',
      teach: [
        {
          emoji: '⛽',
          heading: 'The cost of using the chain',
          body: 'Every on-chain action pays a "gas" fee to the network for processing it. Gas rises when the network is busy. Big moves and NFT mints can spike fees — so timing matters.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'Gas is a fee paid to…',
          options: ['The network for processing', 'Your bank', 'The exchange CEO'],
          answer: 0,
          explain: 'It compensates the validators who process your transaction.',
        },
        {
          kind: 'blank',
          prompt: 'Gas fees rise when the network is ___.',
          options: ['busy', 'empty', 'offline'],
          answer: 0,
          explain: 'High demand for block space = higher gas.',
        },
        {
          kind: 'choice',
          prompt: 'To pay less gas, you can…',
          options: ['Transact when the network is quiet', 'Use more leverage', 'Send twice'],
          answer: 0,
          explain: 'Off-peak times have cheaper gas.',
        },
      ],
    },
    {
      id: 'df-amm',
      title: 'Liquidity pools',
      teach: [
        {
          emoji: '🌊',
          heading: 'Swapping against a pool',
          body: 'A decentralized exchange uses an Automated Market Maker (AMM): instead of matching buyers and sellers, you trade against a pool of two tokens. People who deposit into the pool earn a share of the trading fees.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'On an AMM you trade against…',
          options: ['A liquidity pool', 'A single seller', 'A bank'],
          answer: 0,
          explain: 'The pool is the counterparty, priced by a formula.',
        },
        {
          kind: 'blank',
          prompt: 'People who deposit into a pool earn a share of the trading ___.',
          options: ['fees', 'losses', 'gas'],
          answer: 0,
          explain: 'Liquidity providers collect fees from swaps.',
        },
        {
          kind: 'choice',
          prompt: 'AMM stands for…',
          options: ['Automated Market Maker', 'Average Market Move', 'Asset Margin Model'],
          answer: 0,
          explain: 'Automated Market Maker — the pool-based pricing engine.',
        },
      ],
    },
    {
      id: 'df-staking',
      title: 'Staking & yield',
      teach: [
        {
          emoji: '🌱',
          heading: 'Earn by putting crypto to work',
          body: 'Staking locks your coins to help secure a network in return for rewards. "Yield" more broadly is any return from lending or providing liquidity. Higher advertised yields usually mean higher risk — there’s no free lunch.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'Staking rewards you for…',
          options: ['Locking coins to secure a network', 'Trading more', 'Paying gas'],
          answer: 0,
          explain: 'You help secure the chain and earn rewards.',
        },
        {
          kind: 'blank',
          prompt: 'Sky-high advertised yields usually mean higher ___.',
          options: ['risk', 'safety', 'gas'],
          answer: 0,
          explain: 'Outsized yield is compensation for outsized risk.',
        },
        {
          kind: 'choice',
          prompt: '"Yield" generally refers to…',
          options: ['Returns from lending / providing liquidity', 'The gas fee', 'A candlestick'],
          answer: 0,
          explain: 'It’s the income earned on deployed crypto.',
        },
      ],
    },
    {
      id: 'df-safety',
      title: 'Scams & safety',
      teach: [
        {
          emoji: '🛡️',
          heading: 'Don’t get rugged',
          body: 'A "rug pull" is when a project’s team drains the liquidity and vanishes. Protect yourself: never share your seed phrase, revoke old token approvals, verify contract addresses, and DYOR (do your own research) before aping in.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'A "rug pull" is when…',
          options: ['The team drains liquidity and disappears', 'Gas spikes', 'Price dips 5%'],
          answer: 0,
          explain: 'Insiders pull the funds, leaving holders with nothing.',
        },
        {
          kind: 'blank',
          prompt: 'Never share your ___ phrase with anyone.',
          options: ['seed', 'gas', 'limit'],
          answer: 0,
          explain: 'Your seed phrase = full control of your wallet.',
        },
        {
          kind: 'choice',
          prompt: 'Before investing, you should…',
          options: ['DYOR (do your own research)', 'Ape in blindly', 'Follow hype only'],
          answer: 0,
          explain: 'Research first; hype is not due diligence.',
        },
      ],
    },
  ],
};

// ============================================================================
// A+ SETUPS  (premium) — the capstone that ties concepts together
// ============================================================================
const SETUPS: Track = {
  id: 'setups',
  title: 'Building A+ Setups',
  subtitle: 'Turn the concepts into a repeatable edge',
  icon: 'ribbon',
  color: '#FFC83D',
  premium: true,
  lessons: [
    {
      id: 'as-checklist',
      title: 'The A+ checklist',
      teach: [
        {
          emoji: '✅',
          heading: 'Four boxes to tick',
          body: 'A high-quality setup usually has: 1) a clear higher-timeframe bias, 2) a key level/zone (S/R, order block, value area), 3) a trigger (structure shift, candle signal), and 4) a strong risk-to-reward. No checklist, no trade.',
        },
      ],
      exercises: [
        {
          kind: 'order',
          prompt: 'Order the A+ checklist (first → last).',
          items: ['Higher-timeframe bias', 'Key level / zone', 'A trigger', 'Strong risk-to-reward'],
          explain: 'Bias → location → trigger → reward. Then execute.',
        },
        {
          kind: 'choice',
          prompt: 'If a setup misses the checklist, you should…',
          options: ['Skip it', 'Take it anyway', 'Double the size'],
          answer: 0,
          explain: 'No edge = no trade. Wait for the next one.',
        },
        {
          kind: 'blank',
          prompt: 'The first box is a clear higher-timeframe ___.',
          options: ['bias', 'spread', 'wick'],
          answer: 0,
          explain: 'Direction first — trade with the HTF trend.',
        },
      ],
    },
    {
      id: 'as-confluence',
      title: 'Stack confluence',
      teach: [
        {
          heading: 'Many reasons, one price',
          body: 'The best entries happen where several signals overlap: a Fibonacci level + support + an order block + a trendline, all at the same price. One reason is a guess; four lining up is a plan.',
          chart: CHARTS.supportResistance,
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'Confluence means…',
          options: ['Several signals agree at one price', 'One indicator', 'Random entries'],
          answer: 0,
          explain: 'Stacked, independent reasons raise the odds.',
        },
        {
          kind: 'blank',
          prompt: 'More confluence = ___ probability.',
          options: ['higher', 'lower', 'zero'],
          answer: 0,
          explain: 'Agreeing signals strengthen the case.',
        },
        {
          kind: 'choice',
          prompt: 'A single reason for a trade is best treated as…',
          options: ['A weak signal', 'A sure thing', 'Confluence'],
          answer: 0,
          explain: 'One factor alone is a guess, not an edge.',
        },
      ],
    },
    {
      id: 'as-plan',
      title: 'Plan before you click',
      teach: [
        {
          heading: 'Entry, stop, target — set first',
          body: 'Define all three before entering: where you get in, where you’re wrong (stop-loss), and where you take profit. Knowing them in advance removes emotion and lets you size the trade to your risk.',
          chart: CHARTS.slTp,
        },
      ],
      exercises: [
        {
          kind: 'order',
          prompt: 'Order what you decide BEFORE entering.',
          items: ['Entry', 'Stop-loss', 'Take-profit'],
          explain: 'All three are set before the trade, not during it.',
        },
        {
          kind: 'choice',
          prompt: 'Planning entry/stop/target in advance mainly…',
          options: ['Removes emotion', 'Guarantees profit', 'Raises leverage'],
          answer: 0,
          explain: 'A pre-set plan keeps emotion out of the decision.',
        },
        {
          kind: 'blank',
          prompt: 'Your stop-loss marks where you are ___.',
          options: ['wrong', 'right', 'rich'],
          answer: 0,
          explain: 'The stop is your "I was wrong" exit.',
        },
      ],
    },
    {
      id: 'as-patience',
      title: 'Wait for A+ only',
      teach: [
        {
          emoji: '🎯',
          heading: 'Quality over quantity',
          body: 'You don’t need many trades — you need good ones. Most pros take only 1–2 A+ setups a day and pass on everything else. Patience is the edge most traders never develop.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'Most pros take how many A+ setups a day?',
          options: ['Just 1–2', '20+', 'As many as possible'],
          answer: 0,
          explain: 'Few high-quality trades beat many mediocre ones.',
        },
        {
          kind: 'blank',
          prompt: 'The hardest edge to develop is ___.',
          options: ['patience', 'leverage', 'gas'],
          answer: 0,
          explain: 'Sitting on your hands is harder than it sounds.',
        },
        {
          kind: 'choice',
          prompt: 'A "B-grade" setup should usually be…',
          options: ['Skipped', 'Traded big', 'Traded with no stop'],
          answer: 0,
          explain: 'Only take the best; pass on the rest.',
        },
      ],
    },
    {
      id: 'as-review',
      title: 'Review every trade',
      teach: [
        {
          emoji: '📓',
          heading: 'The journal closes the loop',
          body: 'After every trade, log the setup, your emotions, and whether you followed your plan — not just the win/loss. Reviewing your journal weekly is how you find your leaks and turn mistakes into an edge.',
        },
      ],
      exercises: [
        {
          kind: 'choice',
          prompt: 'A good journal logs…',
          options: ['Setup, emotions & plan-adherence', 'Only the P&L', 'Nothing'],
          answer: 0,
          explain: 'Process matters more than the single result.',
        },
        {
          kind: 'blank',
          prompt: 'Reviewing your journal helps you find your ___.',
          options: ['leaks', 'luck', 'gas'],
          answer: 0,
          explain: 'Patterns of mistakes show up over many trades.',
        },
        {
          kind: 'choice',
          prompt: 'You should judge a trade mostly by…',
          options: ['Whether you followed your plan', 'Whether it won', 'The size'],
          answer: 0,
          explain: 'A good loss (followed plan) beats a lucky win.',
        },
      ],
    },
  ],
};

export const FREE_EXTRA5: Track[] = [DEFI];
export const PREMIUM_EXTRA5: Track[] = [SETUPS];
