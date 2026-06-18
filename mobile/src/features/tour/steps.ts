import type { TourStep } from '@/store/tour';

// First-login walkthrough. Targets map to <TourTarget id=...> on the Home
// screen; the final, target-less step orients the user to the tab bar.
export const HOME_TOUR: TourStep[] = [
  {
    target: 'home-streak',
    title: 'Keep your streak 🔥',
    body: 'Trade or learn a little every day. Miss a day and the flame goes out — so show up!',
  },
  {
    target: 'home-daily',
    title: 'Hit your daily goal',
    body: 'Earn XP each day to level up, climb divisions, and stay sharp.',
  },
  {
    target: 'home-diamonds',
    title: 'Diamonds 💎',
    body: 'Your currency. Start with 100 and grab +50 free every day you log in. Spend them to create a competition (25) or join one (10) — running low? Watch an ad or top up.',
  },
  {
    target: 'home-lesson',
    title: 'Learn & earn 📚',
    body: 'Your daily lesson lives here. Bite-sized lessons on candles, ICT, Elliott, Wyckoff and more — finish them to earn XP and climb the ranks. Find them all in the Learn tab.',
  },
  {
    target: 'home-duel',
    title: 'Challenge a friend',
    body: 'Start a 1-on-1 duel and prove who reads the market better — winner takes the bragging rights.',
  },
  {
    title: 'Find your way around',
    body: 'Compete in leagues, Learn with lessons, add Friends, and track your Profile — all from the tabs below. You’re ready!',
  },
];
