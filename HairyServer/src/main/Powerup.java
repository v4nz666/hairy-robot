package main;

import java.util.Random;

public abstract class Powerup {
  private static Random _rand = new Random();
  
  public static Powerup random() {
    switch(_rand.nextInt(3)) {
      case 0: return new Shields();
      case 1: return new Life();
      case 2: return new Guns();
    }
    
    return null;
  }
  
  public int x, y;
  public int vx, vy;
  public int color;
  public int size = 16;
  
  public static class Shields extends Powerup {
    public int shields = 50;
    public Shields() { color = 0x00FFFF; }
  }
  
  public static class Life extends Powerup {
    public int life = 50;
    public Life() { color = 0x00FF00; }
  }
  
  public static class Guns extends Powerup {
    public int guns = 1;
    public Guns() { color = 0xFF0000; }
  }
}