package space.celestials;

import main.Entity;

public abstract class Celestial extends Entity {
  public Celestial(double x, double y, int size) {
    super(-1, x, y, size, -1);
  }
}