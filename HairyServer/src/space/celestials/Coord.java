package space.celestials;

public class Coord {
  public final double x, y;
  
  @Override
  public String toString() {
    return "x:" + x + " y: " + y; 
  }
  
  public Coord(double x, double y) {
    this.x = x;
    this.y = y;
  }
}