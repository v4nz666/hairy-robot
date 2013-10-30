package space.celestials;

public class Asteroid  extends Celestial{
  @Override
  public String toString() {
    return "Asteroid " + super.toString();
  }
  
  private Coord[] _points;
  
  public static Asteroid generate(StarSystem system, double distance, double x, double y, int size, Coord[] coords) {
    Asteroid a = new Asteroid(system, distance, size);
    
    // Override the random x/y coordinates with those provided by the Asteroid Belt
    a.x = system.star.x + x;
    a.y = system.star.y + y;
    a._points = coords;
    return a;
  }
  
  private Asteroid(StarSystem system, double distance, int size) {
    super(system, system.star, distance, size, 0, 0);
  }
  
  @Override
  public String getType() {
    return "asteroid";
  }

  @Override
  public String getFill() {
    return "#333333";
  }
  
  @Override
  public String getStroke() {
    return "#444444";
  }
  
  public Coord[] getPoints() {
    return _points;
  }
}
