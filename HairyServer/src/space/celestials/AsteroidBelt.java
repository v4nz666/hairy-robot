package space.celestials;

import main.Asteroid;

public class AsteroidBelt extends Celestial {
  public static AsteroidBelt generate(StarSystem system, Celestial parent, double distance) {
    return new AsteroidBelt(system, parent, distance, 0, 0, 0);
  }
  
  private AsteroidBelt(StarSystem system, Celestial parent, double distance, int size, float mass, int temp) {
    super(system, parent, distance, size, mass, temp);
  }

  //private Asteroid[] _asteroids;
}