package main;

public class Bullet extends Entity {
  protected User _user;
  
  public double vx, vy;
  public int damage = 20;
  
  public Bullet(User user, double offset) {
    super(user.id, user.x, user.y, 2);
    _user = user;
    double offsetX = Math.cos(Math.toRadians(user.angle + offset));
    double offsetY = Math.sin(Math.toRadians(user.angle + offset));
    vx = user.vx + offsetX + Math.cos(Math.toRadians(user.angle)) * (user.velMax * 2);
    vy = user.vy + offsetY + Math.sin(Math.toRadians(user.angle)) * (user.velMax * 2);
  }
  
  public static class Explosion {
    public final String size;
    public final int x, y;
    public final long tick;
    
    public Explosion(String size, int x, int y, long tick) {
      this.size = size;
      this.x = x;
      this.y = y;
      this.tick = tick;
    }
  }
}