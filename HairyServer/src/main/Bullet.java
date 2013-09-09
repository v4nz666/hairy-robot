package main;

public class Bullet {
  protected User _user;
  
  public double x, y;
  public double vx, vy;
  public int size = 2;
  public int id;
  public int damage;
  
  public Bullet(User user, double offset) {
    _user = user;
    double offsetX = Math.cos(Math.toRadians(user.angle + offset));
    double offsetY = Math.sin(Math.toRadians(user.angle + offset));
    x = user.x;
    y = user.y;
    vx = user.vx + offsetX + Math.cos(Math.toRadians(user.angle)) * (user.velMax * 2);
    vy = user.vy + offsetY + Math.sin(Math.toRadians(user.angle)) * (user.velMax * 2);
    id = user.id;
  }
}