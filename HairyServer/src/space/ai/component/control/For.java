package space.ai.component.control;

import space.ai.component.Component;

public class For extends Component {
  public Component.Value<Integer> start, stop;
  public final Component.Value<Integer> counter = new Component.Value<Integer>() {
    @Override public Integer value() { return _index; }
  };
  
  private int _index;
  
  public Component.Execution loop = new Component.Execution() {
    @Override
    public void execute() {
      int s1 = start.value();
      int s2 = stop.value();
      
      for(_index = s1; _index < s2; _index++) {
        execution.execute();
      }
    }
  };
}