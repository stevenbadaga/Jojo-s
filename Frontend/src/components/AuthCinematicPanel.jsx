import { Check, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react'

const AUTH_VIDEO = 'https://cdn.coverr.co/videos/coverr-woman-shopping-for-fresh-produce/1080p.mp4'
const AUTH_POSTER = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1800&q=86'

const content = {
  login: {
    kicker: 'MarketMet member access',
    title: 'Fresh shopping, right where you left it.',
    body: 'Sign in to manage saved items, follow orders and move through checkout faster.',
    points: ['Saved favourites', 'Live order updates', 'Secure checkout'],
  },
  register: {
    kicker: 'Join MarketMet',
    title: 'Your fresh-market account starts here.',
    body: 'Create one account for favourites, order history, delivery updates and a faster shopping experience.',
    points: ['Personalised shopping', 'Order tracking', 'Member convenience'],
  },
}

const AuthCinematicPanel = ({ mode = 'login' }) => {
  const copy = content[mode] || content.login

  return (
    <aside className="marketmet-auth-visual" aria-label="MarketMet fresh grocery experience">
      <img className="marketmet-auth-poster" src={AUTH_POSTER} alt="Fresh vegetables displayed in a supermarket" />
      <video
        className="marketmet-auth-video"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={AUTH_POSTER}
        aria-hidden="true"
      >
        <source src={AUTH_VIDEO} type="video/mp4" />
      </video>
      <div className="marketmet-auth-scrim" />

      <div className="marketmet-auth-visual-topline">
        <span><ShoppingBag className="w-4 h-4" /> MarketMet</span>
        <span><ShieldCheck className="w-4 h-4" /> Secure access</span>
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
