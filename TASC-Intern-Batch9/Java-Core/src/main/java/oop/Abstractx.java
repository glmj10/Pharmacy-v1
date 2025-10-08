package oop;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public abstract class Abstractx {
    public static void main(String[] args) {
        Abstract a = new A(List.of(1,2,3,4,5, 6));
        Abstract b = new B(List.of(6,7,8,9,10));
        for(Integer i : a.list) {
            System.out.print(i + " ");
        }
        System.out.println();
        for(Integer i : b.list) {
            System.out.print(i + " ");
        }
    }
}


abstract class Abstract {
    List<Integer> list = new ArrayList<>(Arrays.asList(1, 2, 3, 4, 5));

    public Abstract(List<Integer> list) {
        for(Integer i : this.list) {
            System.out.print(i + "-");
        }
        System.out.println();
        this.list = list;
    }
}

class A extends Abstract {
    public A(List<Integer> list) {
        super(list);
    }
}

class B extends Abstract {

    public B(List<Integer> list) {
        super(list);
    }
}