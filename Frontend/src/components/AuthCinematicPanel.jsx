import { Check, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react'

const AUTH_POSTER = 'https://images.pexels.com/photos/5951182/pexels-photo-5951182.jpeg?auto=compress&cs=tinysrgb&w=1920'

const content = {
  login: {
    kicker: 'MarketMet member access',
    title: 'Your groceries, ready when you are.',
    body: 'Sign in to pick up where you left off with saved favourites, order updates and a faster checkout.',
    points: ['Saved favourites', 'Live order updates', 'Secure checkout'],
  },
  register: {
    kicker: 'Join MarketMet',
    title: 'A fresher way to shop starts here.',
    body: 'Create one account for favourites, order history, delivery updates and a smoother checkout experience.',
    points: ['Personalised shopping', 'Order tracking', 'Faster checkout'],
  },
}

const AuthCinematicPanel = ({ mode = 'login' }) => {
  const copy = content[mode] || content.login

  return (
    <aside className="marketmet-auth-visual" aria-label="MarketMet supermarket experience">
      <img
        className="marketmet-auth-poster"
        src={AUTH_POSTER}
        alt="Fully stocked supermarket aisle with organized grocery shelves"
      />
      <div className="marketmet-auth-scrim" />

      <div className="marketmet-auth-visual-topline">
        <span><ShoppingBag className="w-4 h-4" /> MarketMet</span>
        <span><ShieldCheck className="w-4 h-4" /> Private & secure</span>
      </div>

      <div className="marketmet-auth-visual-copy">
        <div className="marketmet-auth-kicker"><Sparkles className="w-4 h-4" /> {copy.kicker}</div>
        <h2>{copy.title}</h2>
        <p>{copy.body}</p>
        <div className="marketmet-auth-points">
          {copy.points.map((point) => (
            <span key={point}><Check className="w-4 h-4" /> {point}</span>
          ))}
        </div>
      </div>
    </aside>
  )
}

export default AuthCinematicPanel
