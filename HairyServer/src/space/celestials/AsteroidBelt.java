package space.celestials;

import main.Asteroid;

public class AsteroidBelt extends Celestial {
  public AsteroidBelt(StarSystem starSystem, double d) {
    super(0, 0, 0);
  }

  private Asteroid[] _asteroids;
}