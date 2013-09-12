package main;

import java.util.Random;

public abstract class Powerup extends Entity {
  private static Random _rand = new Random();
  
  public static Powerup random(double x, double y) {
    switch(_rand.nextInt(3)) {
      case 0: return new Shields(x, y);
      case 1: return new Life(x, y);
      case 2: return new Guns(x, y);
    }
    
    return null;
  }
  
  public final int vx, vy;
  public final String color;
  
  private Powerup(double x, double y, int size, String color) {
    super(-1, x, y, size);
    vx = 1;
    vy = 1;
    this.color = color;
  }
  
  public abstract void use(User user);
  
  public static class Shields extends Powerup {
    public int properties = 50;
    private Shields(double x, double y) {
      super(x, y, 16, "#00FFFF");
    }
    
    @Override
    public void use(User user) {
      user.shields = Math.min(user.shields + properties, user.maxShields);
    }
  }
  
  public static class Life extends Powerup {
    public int properties = 50;
    private Life(double x, double y) {
      super(x, y, 16, "#00FF00");
    }
    
    @Override
    public void use(User user) {
      user.life = Math.min(user.life + properties, user.maxLife);
    }
  }
  
  public static class Guns extends Powerup {
    public int properties = 1;
    private Guns(double x, double y) {
      super(x, y, 16, "#FF0000");
    }
    
    @Override
    public void use(User user) {
      user.guns = Math.min(user.guns + properties, user.maxGuns);
    }
  }
}