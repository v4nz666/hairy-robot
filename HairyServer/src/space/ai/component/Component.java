package space.ai.component;

import java.util.ArrayList;

public abstract class Component {
  public final ExecutionStack execution = new ExecutionStack();
  
  public static abstract class Value<T> {
    public abstract T value();
    public void clear() { };
  }
  
  public static class ExecutionStack {
    private ArrayList<Execution> _e = new ArrayList<>();
    
    public boolean add(Execution e) {
      e.setStack(this);
      return _e.add(e);
    }
    
    public boolean remove(Execution e) {
      return _e.remove(e);
    }
    
    public void execute() {
      for(Execution e : _e) {
        e.execute();
      }
    }
  }
  
  public static abstract class Execution {
    private ExecutionStack _es;
    
    private void setStack(ExecutionStack es) {
      _es = es;
    }
    
    public void remove() {
      _es.remove(this);
    }
    
    public abstract void execute();
  }
}