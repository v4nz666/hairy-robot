package main;

public abstract class Entity {
  public final int id;
  public double x, y;
  public int size;
  
  public Entity(int id, double x, double y, int size) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.size = size;
  }
}