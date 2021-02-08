const Sequelize = require('sequelize');

// 시퀄라이즈는 알아서 id를 기본 키로 연결하므로 id 컬럼은 적어줄 필요가 없다.
// 자료형 : STRING, INTEGER, BOOLEAN, DATE, INTEGER
// 옵션 : allowNull, unique, defaultValue
module.exports = class User extends Sequelize.Model {
  static init(sequelize) {                  // 테이블에 대한 설정
    return super.init({                     // 테이블 컬럼에 대한 설정
      email: {
        type: Sequelize.STRING(45),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(80),
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(45),
        allowNull: false,
      },
      profileImage: {
        type: Sequelize.STRING(80),
        allowNull: true,
      },
      backgroundImage: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      profileMessage: {
        type: Sequelize.STRING(45),
        allowNull: true,
      }
    }, {                                    // 테이블 자체에 대한 설정
      sequelize,
      timestamps: true,                     // true면 createdAt, updatedAt 컬럼을 추가한다.
      underscored: false,                   // true면 디폴트인 캐멀 케이스를 스네이크 케이스로 바꿈(createdAt->created_at)
      modelName: 'User',                    // 모델 이름 설정
      tableName: 'users',                   // 테이블 이름 설정. 기본적으로 소문자 및 복수형
      paranoid: true,                       // true면 deletedAt 컬럼 생성. 로우를 삭제할 때 완전히 지워지지 않고 deletedAt에 지운 시각이 기록. 즉, 로우를 복원해야 할 상황이 생길 것 같다면 true설정.
      charset: 'utf8mb4',                   // 한글과 이모티콘 입력을 위한.
      collate: 'utf8mb4_general_ci',        // 한글과 이모티콘 입력을 위한.
    });
  }

  static associate(db) {                    // 다른 모델과의 관계 설정. 여기에서 릴레이션을 설정할 수 있지만, 시퀄라이즈 자체에서 관계를 따로 정의할 수 있다.
    db.User.belongsToMany(db.User, {
      foreignKey: 'followeeId',
      as: 'Followers',
      through: 'Follow',
    });
    db.User.belongsToMany(db.User, {
      foreignKey: 'followerId',
      as: 'Followees',
      through: 'Follow',
    });
  }
};

/*
이 모델 하나에 아래의 쿼리가 대응된다.

CREATE TABLE IF NOT EXISTS `users` (
	`id` INTEGER NOT NULL auto_increment , 
	`email` VARCHAR(45) NOT NULL UNIQUE, 
	`password` VARCHAR(45) NOT NULL, 
	`name` VARCHAR(45) NOT NULL, 
	`profileImage` VARCHAR(45), 
	`profileMessage` VARCHAR(45), 
	`createdAt` DATETIME NOT NULL, 
	`updatedAt` DATETIME NO NULL, 
	`deletedAt` DATETIME, PRIMARY KEY (`id`)) 
	ENGINE=InnoDB 
	DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci;

SHOW INDEX FROM `users` FROM `user`

CREATE TABLE IF NOT EXISTS `Follow` (
	`createdAt` DATETIME NOT NULL, 
	`updatedAt` DATETIME NOT NULL, 
	`followeeId` INTEGER , 
	`followerId` INTEGER , 
	PRIMARY KEY (`followeeId`, `followerId`), 
	FOREIGN KEY (`followeeId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, 
	FOREIGN KEY (`followerId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE) 
	ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci
  
  SHOW INDEX FROM `Follow` FROM `user`
  */