import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.ensemble import IsolationForest

if __name__ == '__main__':
    print("ok")
    df = pd.read_csv('TOTAL.csv')

    rng = np.random.RandomState(42)

    # TODO - preprocess et utiliser le dernier
    X = df.as_matrix()[:, 2:-1]

    # # fit the model
    clf = IsolationForest(max_samples=100, random_state=rng, contamination=0.01)
    clf.fit(X)
    y_pred_train = clf.predict(X)
    # y_pred_test = clf.predict(X_test)
    # y_pred_outliers = clf.predict(X_outliers)

    print(y_pred_train.shape)
    print(np.where(y_pred_train == -1))
    print(len(np.where(y_pred_train == -1)[0]))

    # # plot the line, the samples, and the nearest vectors to the plane
    # xx, yy = np.meshgrid(np.linspace(-5, 5, 50), np.linspace(-5, 5, 50))
    # Z = clf.decision_function(np.c_[xx.ravel(), yy.ravel()])
    # Z = Z.reshape(xx.shape)
    #
    # plt.title("IsolationForest")
    # plt.contourf(xx, yy, Z, cmap=plt.cm.Blues_r)
    #
    # b1 = plt.scatter(X[:, 0], X[:, 1], c='white',
    #                  s=20, edgecolor='k')
    # # b2 = plt.scatter(X_test[:, 0], X_test[:, 1], c='green',
    # #                  s=20, edgecolor='k')
    # # c = plt.scatter(X_outliers[:, 0], X_outliers[:, 1], c='red',
    # #                 s=20, edgecolor='k')
    # plt.axis('tight')
    # plt.xlim((-5, 5))
    # plt.ylim((-5, 5))
    # plt.legend([b1],
    #            ["training observations"],
    #            loc="upper left")
    #
    # # plt.legend([b1, b2, c],
    # #            ["training observations",
    # #             "new regular observations", "new abnormal observations"],
    # #            loc="upper left")
    # plt.show()
