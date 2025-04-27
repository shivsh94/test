import Activities from "./Activities"
import Navigation from "./Navigation"
import WelcomeClient from "./WelcomeClient"

function Homepage() {
  return (
    <div>
      <WelcomeClient />
      <Navigation />
      <Activities />
      <div className="mb-10"></div>
    </div>
  )
}

export default Homepage
