package main;

public class Explosion {
  public final int size;
  public final int x, y;
  public final long tick;
  
  public Explosion(int size, int x, int y, long tick) {
    this.size = size;
    this.x = x;
    this.y = y;
    this.tick = tick;
  }
}