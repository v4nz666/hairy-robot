package main;

public class Gun {
  public final space.data.guns.Gun gun;
  public final space.data.guns.Bullet bullet;
  
  public Gun(space.data.guns.Gun gun, space.data.guns.Bullet bullet) {
    this.gun = gun;
    this.bullet = bullet;
  }
  
  public void fire(User user) {
    gun.fire(user, bullet);
  }
}