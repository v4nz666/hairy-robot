package space.game;

import main.Entity;
import main.Server;
import main.User;

public class Bullet extends Entity {
  private static int _id;
  public static int nextID() { return _id++; }
  
  private User _user;
  public final int damage;
  
  private int _range;
  private double _startX, _startY;
  
  private Add _add = new Add();
  private Rem _rem = new Rem();
  
  public User user() { return _user; }
  public Add serializeForAdd() { return _add; }
  public Rem serializeForRem() { return _rem; }
  
  public Bullet(User user, space.data.guns.Bullet bullet, float offsetAngle) {
    this(user, bullet, offsetAngle, 0);
  }
  
  public Bullet(User user, space.data.guns.Bullet bullet, float offsetAngle, float offsetSpacing) {
    super(nextID(), user.x, user.y, bullet.getSize(), user.id);
    
    _range = bullet.getRange();
    _startX = user.x;
    _startY = user.y;
    
    _user = user;
    angle = user.angle;
    damage = bullet.getDamage();
    
    if(bullet instanceof space.data.guns.Bullet.Ballistic) {
      double a = Math.toRadians(user.angle);
      double a2 = Math.toRadians(offsetAngle);
      double a3 = Math.toRadians(offsetSpacing);
      x += Math.cos(a + a3) * user.size / 2;
      y += Math.sin(a + a3) * user.size / 2;
      
      space.data.guns.Bullet.Ballistic b = (space.data.guns.Bullet.Ballistic)bullet;
      vx = minOrMax(Math.cos(a + a2) * b.getVel(), user.vx);
      vy = minOrMax(Math.sin(a + a2) * b.getVel(), user.vy);
      acc = b.getAcc();
      maxVel = b.getMaxVel();
      
      _add._vx = vx;
      _add._vy = vy;
      _add._acc = acc;
      _add._mvel = maxVel;
    }
    
    _add._size = size;
    _add._x = x;
    _add._y = y;
    _add._a = angle;
  }
  
  private double minOrMax(double a, double b) {
    if(a == 0) return b; else
    if(a  < 0) return Math.min(a, b);
               return Math.max(a, b);
  }
  
  private double distance(double x1, double y1, double x2, double y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }
  
  @Override
  public void update(double deltaT) {
    super.update(deltaT);
    
    if(distance(x, y, _startX, _startY) > _range ||
       x < -size || x > Server.W + size ||
       y < -size || y > Server.H + size) {
      remove();
    }
  }
  
  public void remove() {
    Server.instance().removeBullet(this);
  }
  
  public class Add {
    private int _size;
    private double _x, _y, _a, _vx, _vy, _acc, _mvel;
    
    public int getId() { return id; }
    public double getX() { return _x; }
    public double getY() { return _y; }
    public int getSize() { return _size; }
    public double getAngle() { return _a; }
    public double getVx() { return _vx; }
    public double getVy() { return _vy; }
    public double getAcc() { return _acc; }
    public double getMaxVel() { return _mvel; }
  }
  
  public class Rem {
    public int getId() { return id; }
  }
}